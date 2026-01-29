import json
import time
from datetime import datetime
from threading import Lock
from urllib.parse import urlparse

from django.conf import settings
from django.http import JsonResponse
from django.utils import timezone

from .models import BlockEntry


def get_client_ip(request):
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0].strip()
    else:
        ip = request.META.get("REMOTE_ADDR") or ""
    return ip


def get_origin_domain(request):
    origin = request.META.get("HTTP_ORIGIN") or request.META.get("HTTP_REFERER") or ""
    host = ""
    if origin:
        try:
            parsed = urlparse(origin)
            host = parsed.hostname or ""
        except Exception:
            host = ""
    if not host:
        host_header = request.META.get("HTTP_HOST") or ""
        if host_header:
            host = host_header.split(":")[0]
    return host.lower()


class AccessControlMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.blocklist_cache = {"ips": set(), "domains": set(), "loaded_at": None}
        self.cache_ttl_seconds = 60
        self.cache_lock = Lock()
        self.rate_limits = {}
        self.rate_limit_max_requests = 100
        self.rate_limit_window_seconds = 60

    def __call__(self, request):
        path = request.path or ""
        if path.startswith("/api/"):
            ip = get_client_ip(request)
            domain = get_origin_domain(request)

            if self.is_blocked(ip, domain):
                request.blocked = True
                request.block_reason = "blocklist"
                data = {"detail": "Access blocked"}
                return JsonResponse(data, status=403)

            if self.is_rate_limited(ip):
                request.blocked = True
                request.block_reason = "rate_limit"
                request.rate_limited = True
                data = {"detail": "Too many requests"}
                return JsonResponse(data, status=429)

        response = self.get_response(request)
        return response

    def refresh_blocklist_cache_if_needed(self):
        now = timezone.now()
        loaded_at = self.blocklist_cache["loaded_at"]
        if loaded_at and (now - loaded_at).total_seconds() < self.cache_ttl_seconds:
            return
        with self.cache_lock:
            loaded_at = self.blocklist_cache["loaded_at"]
            if loaded_at and (now - loaded_at).total_seconds() < self.cache_ttl_seconds:
                return
            ips = set()
            domains = set()
            for entry in BlockEntry.objects.filter(is_active=True):
                if entry.type == "ip":
                    ips.add(entry.value)
                elif entry.type == "domain":
                    domains.add(entry.value.lower())
            self.blocklist_cache = {"ips": ips, "domains": domains, "loaded_at": now}

    def is_blocked(self, ip, domain):
        self.refresh_blocklist_cache_if_needed()
        ips = self.blocklist_cache["ips"]
        domains = self.blocklist_cache["domains"]
        if ip and ip in ips:
            return True
        if domain and domain in domains:
            return True
        return False

    def is_rate_limited(self, ip):
        if not ip:
            return False
        
        # Bypass rate limit for localhost
        if ip in ['127.0.0.1', '::1', 'localhost']:
            return False

        now = time.time()
        with self.cache_lock:
            record = self.rate_limits.get(ip)
            if not record:
                self.rate_limits[ip] = {"start_time": now, "count": 1}
                return False
            
            elapsed = now - record["start_time"]
            if elapsed > self.rate_limit_window_seconds:
                self.rate_limits[ip] = {"start_time": now, "count": 1}
                return False
            
            if record["count"] >= self.rate_limit_max_requests:
                return True
            
            record["count"] += 1
            return False


class ApiLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.ip_request_counts = {}
        self.last_reset_date = timezone.now().date()

    def __call__(self, request):
        start_time = time.time()
        response = self.get_response(request)
        try:
            self.log_request(request, response, start_time)
        except Exception:
            pass
        return response

    def log_request(self, request, response, start_time):
        path = request.path or ""
        if not path.startswith("/api/"):
            return
            
        # Reset counters if day changed
        current_date = timezone.now().date()
        if current_date > self.last_reset_date:
            self.ip_request_counts = {}
            self.last_reset_date = current_date

        ip = get_client_ip(request)
        
        # Count requests per IP
        if ip in self.ip_request_counts:
            self.ip_request_counts[ip] += 1
            # If IP has already requested today, do NOT log to file (suppress duplicate IP logs)
            return
        
        # First request from this IP today
        self.ip_request_counts[ip] = 1
        
        duration = time.time() - start_time
        from django.contrib.auth.models import AnonymousUser

        ip = get_client_ip(request)
        origin = request.META.get("HTTP_ORIGIN", "")
        host = request.META.get("HTTP_HOST", "")
        method = request.method
        status_code = getattr(response, "status_code", None)
        user_agent = request.META.get("HTTP_USER_AGENT", "")
        referer = request.META.get("HTTP_REFERER", "")
        user = getattr(request, "user", None)
        if user and not isinstance(user, AnonymousUser) and getattr(user, "is_authenticated", False):
            user_id = user.id
            username = user.get_username()
        else:
            user_id = None
            username = None
        blocked = getattr(request, "blocked", False)
        block_reason = getattr(request, "block_reason", "")
        rate_limited = getattr(request, "rate_limited", False)
        timestamp = datetime.utcnow().isoformat() + "Z"
        log_entry = {
            "timestamp": timestamp,
            "ip": ip,
            "origin": origin,
            "host": host,
            "path": path,
            "method": method,
            "status_code": status_code,
            "user_agent": user_agent,
            "referer": referer,
            "user_id": user_id,
            "username": username,
            "blocked": blocked,
            "block_reason": block_reason,
            "rate_limited": rate_limited,
            "duration_ms": int(duration * 1000),
        }
        base_dir = settings.BASE_DIR
        date_str = timezone.now().date().isoformat()
        file_name = f"logs_{date_str}.json"
        file_path = base_dir / file_name
        with open(file_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(log_entry, ensure_ascii=False))
            f.write("\n")

