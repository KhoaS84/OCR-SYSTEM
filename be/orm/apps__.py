from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'
    
    def ready(self):
        # Fix for Python 3.14 compatibility issue with Django template context
        # This fixes: AttributeError: 'super' object has no attribute 'dicts'
        # Use the centralized patch function
        try:
            from core.patches import apply_template_context_patch
            apply_template_context_patch()
        except ImportError:
            pass