# Generated by Django 5.2 on 2025-07-03 12:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('prometei', '0006_alter_contactrequest_request_type'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='contactrequest',
            name='course_experience',
        ),
        migrations.RemoveField(
            model_name='contactrequest',
            name='course_package',
        ),
        migrations.AlterField(
            model_name='contactrequest',
            name='request_type',
            field=models.CharField(choices=[('contact', 'Контактна форма'), ('builder', 'Конструктор сайту'), ('promin', 'Заявка Промінь'), ('dream_site', 'Сайт мрії')], default='contact', max_length=20, verbose_name='Тип запиту'),
        ),
    ]
