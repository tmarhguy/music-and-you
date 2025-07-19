"""
Command Line Interface for the Music and You project.
"""

import click
from pathlib import Path
from music_and_you.config import config
from music_and_you.utils.logging import setup_logging, get_logger


logger = get_logger(__name__)


@click.group()
@click.option('--config-file', '-c', type=click.Path(exists=True), help='Configuration file path')
@click.option('--log-level', '-l', default='INFO', help='Logging level')
@click.pass_context
def cli(ctx, config_file, log_level):
    """Music and You: Personality prediction from music listening behavior."""
    ctx.ensure_object(dict)
    
    # Setup logging
    setup_logging(level=log_level)
    
    # Load config
    if config_file:
        ctx.obj['config'] = Config.from_yaml(Path(config_file))
    else:
        ctx.obj['config'] = config
    
    logger.info("Music and You CLI initialized")


@cli.group()
def data():
    """Data ingestion and processing commands."""
    pass


@data.command()
@click.option('--platform', '-p', multiple=True, help='Platform to ingest from (spotify, lastfm, youtube)')
@click.option('--user-id', '-u', help='User ID to ingest data for')
@click.option('--days', '-d', default=180, help='Number of days of history to retrieve')
def ingest(platform, user_id, days):
    """Ingest music listening data from platforms."""
    logger.info(f"Starting data ingestion for platforms: {platform}")
    
    if not platform:
        platform = ['spotify']  # Default to Spotify
    
    # TODO: Implement data ingestion logic
    click.echo(f"Ingesting {days} days of data from {platform} for user {user_id}")


@data.command()
@click.option('--input-file', '-i', required=True, help='Input data file')
@click.option('--output-file', '-o', help='Output features file')
def extract_features(input_file, output_file):
    """Extract features from raw listening data."""
    logger.info(f"Extracting features from {input_file}")
    
    # TODO: Implement feature extraction logic
    click.echo(f"Extracting features from {input_file} to {output_file}")


@cli.group()
def model():
    """Machine learning model commands."""
    pass


@model.command()
@click.option('--features-file', '-f', required=True, help='Features file for training')
@click.option('--labels-file', '-l', required=True, help='Personality labels file')
@click.option('--model-type', '-m', default='ridge', help='Model type (ridge, rf, xgb)')
@click.option('--output-dir', '-o', help='Output directory for trained model')
def train(features_file, labels_file, model_type, output_dir):
    """Train personality prediction models."""
    logger.info(f"Training {model_type} model")
    
    # TODO: Implement model training logic
    click.echo(f"Training {model_type} model with {features_file} and {labels_file}")


@model.command()
@click.option('--model-path', '-m', required=True, help='Path to trained model')
@click.option('--features-file', '-f', required=True, help='Features file for evaluation')
@click.option('--labels-file', '-l', required=True, help='True labels file')
def evaluate(model_path, features_file, labels_file):
    """Evaluate trained models."""
    logger.info(f"Evaluating model from {model_path}")
    
    # TODO: Implement model evaluation logic
    click.echo(f"Evaluating model {model_path}")


@cli.group()
def db():
    """Database management commands."""
    pass


@db.command()
def init():
    """Initialize database tables."""
    logger.info("Initializing database")
    
    # TODO: Implement database initialization
    click.echo("Database initialized")


@db.command()
def migrate():
    """Run database migrations."""
    logger.info("Running database migrations")
    
    # TODO: Implement database migrations
    click.echo("Database migrations completed")


@cli.group() 
def survey():
    """Survey and assessment commands."""
    pass


@survey.command()
@click.option('--user-id', '-u', required=True, help='User ID')
@click.option('--assessment-type', '-t', default='TIPI', help='Assessment type (TIPI, BFI-2)')
def create(user_id, assessment_type):
    """Create a new personality assessment for a user."""
    logger.info(f"Creating {assessment_type} assessment for user {user_id}")
    
    # TODO: Implement survey creation logic
    click.echo(f"Created {assessment_type} assessment for user {user_id}")


@cli.command()
def serve():
    """Start the web application server."""
    logger.info("Starting web server")
    
    # TODO: Implement web server startup
    click.echo("Starting web server on http://localhost:8080")


@cli.command()
@click.option('--check-db', is_flag=True, help='Check database connection')
@click.option('--check-apis', is_flag=True, help='Check API connections')
def health():
    """Check system health and connectivity."""
    logger.info("Running health checks")
    
    if check_db:
        # TODO: Implement database health check
        click.echo("✓ Database connection: OK")
    
    if check_apis:
        # TODO: Implement API health checks
        click.echo("✓ Spotify API: OK")
        click.echo("✓ Last.fm API: OK")


def main():
    """Main entry point for the CLI."""
    cli()


if __name__ == '__main__':
    main()
