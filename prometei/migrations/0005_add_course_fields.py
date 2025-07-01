from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('prometei', '0004_add_dream_site_request_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='contactrequest',
            name='course_package',
            field=models.CharField(blank=True, max_length=50, null=True, verbose_name='Пакет курсу'),
        ),
        migrations.AddField(
            model_name='contactrequest',
            name='course_experience',
            field=models.CharField(blank=True, max_length=50, null=True, verbose_name='Досвід в IT'),
        ),
    ] 