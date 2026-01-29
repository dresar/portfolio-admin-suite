from django.core.management.base import BaseCommand
from api.models import AboutContent

class Command(BaseCommand):
    help = 'Seeds dummy data for AboutContent if it does not exist'

    def handle(self, *args, **kwargs):
        if AboutContent.objects.exists():
            self.stdout.write(self.style.SUCCESS('AboutContent already exists. Skipping seed.'))
            return

        dummy_data = {
            'short_description_id': 'Saya adalah seorang Web Developer yang berdedikasi',
            'short_description_en': 'I am a dedicated Web Developer',
            'long_description_id': '<p>Halo! Nama saya Eka. Saya memiliki passion yang mendalam dalam dunia pengembangan web. Dengan pengalaman lebih dari 5 tahun, saya telah mengerjakan berbagai proyek mulai dari website profil sederhana hingga aplikasi web kompleks.</p><p>Saya percaya bahwa kode yang baik bukan hanya tentang fungsi, tetapi juga tentang seni dan efisiensi. Saya selalu berusaha untuk mengikuti tren teknologi terbaru dan menerapkan praktik terbaik dalam setiap baris kode yang saya tulis.</p>',
            'long_description_en': '<p>Hello! My name is Eka. I have a deep passion for web development. With over 5 years of experience, I have worked on various projects ranging from simple profile websites to complex web applications.</p><p>I believe that good code is not just about function, but also about art and efficiency. I always strive to keep up with the latest technology trends and apply best practices in every line of code I write.</p>',
        }

        AboutContent.objects.create(**dummy_data)
        self.stdout.write(self.style.SUCCESS('Successfully seeded dummy AboutContent data'))
