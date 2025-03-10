# Generated by Django 5.1.3 on 2024-12-09 10:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0002_alter_employee_faceimage'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='attendancelog',
            name='description',
        ),
        migrations.AddField(
            model_name='attendancelog',
            name='check_in_time',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='attendancelog',
            name='check_out_time',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='attendancelog',
            name='date',
            field=models.DateField(auto_now_add=True),
        ),
    ]
