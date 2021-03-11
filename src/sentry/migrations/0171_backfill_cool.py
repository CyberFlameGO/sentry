# Generated by Django 1.11.29 on 2021-03-11 06:29

from django.db import migrations


def backfill_is_cool(apps, schema_editor):
    User = apps.get_model("sentry", "User")

    for user in User.objects.all():
        is_cool = user.id % 1337 == 0
        user.update(is_cool=is_cool)


class Migration(migrations.Migration):
    # This flag is used to mark that a migration shouldn't be automatically run in
    # production. We set this to True for operations that we think are risky and want
    # someone from ops to run manually and monitor.
    # General advice is that if in doubt, mark your migration as `is_dangerous`.
    # Some things you should always mark as dangerous:
    # - Large data migrations. Typically we want these to be run manually by ops so that
    #   they can be monitored. Since data migrations will now hold a transaction open
    #   this is even more important.
    # - Adding columns to highly active tables, even ones that are NULL.
    is_dangerous = False

    # This flag is used to decide whether to run this migration in a transaction or not.
    # By default we prefer to run in a transaction, but for migrations where you want
    # to `CREATE INDEX CONCURRENTLY` this needs to be set to False. Typically you'll
    # want to create an index concurrently when adding one to an existing table.
    # You'll also usually want to set this to `False` if you're writing a data
    # migration, since we don't want the entire migration to run in one long-running
    # transaction.
    atomic = True

    dependencies = [
        ("sentry", "0170_cool_users"),
    ]

    operations = [migrations.RunPython(backfill_is_cool, reverse_code=migrations.RunPython.noop)]
