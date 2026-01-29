import base64
import hashlib
from cryptography.fernet import Fernet
from django.conf import settings

def get_fernet():
    # Derive a 32-byte key from the SECRET_KEY
    key = hashlib.sha256(settings.SECRET_KEY.encode()).digest()
    key_b64 = base64.urlsafe_b64encode(key)
    return Fernet(key_b64)

def encrypt_value(value):
    if not value:
        return value
    f = get_fernet()
    return f.encrypt(value.encode()).decode()

def decrypt_value(token):
    if not token:
        return token
    try:
        f = get_fernet()
        return f.decrypt(token.encode()).decode()
    except Exception:
        # If decryption fails (maybe it wasn't encrypted), return as is or handle error
        return token
