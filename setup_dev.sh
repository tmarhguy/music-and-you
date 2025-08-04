#!/bin/bash

# Development setup script for Music and You project
# This script sets up the development environment with all necessary dependencies

set -e  # Exit on any error

echo "🎵 Setting up Music and You development environment..."

# Check if Python 3.9+ is installed
python_version=$(python3 --version 2>&1 | awk '{print $2}' | cut -d. -f1,2)
required_version="3.9"

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9 or higher."
    exit 1
fi

if ! python3 -c "import sys; exit(0 if sys.version_info >= (3, 9) else 1)"; then
    echo "❌ Python 3.9+ is required. Current version: $python_version"
    exit 1
fi

echo "✅ Python version check passed: $python_version"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Install package in development mode
echo "🔧 Installing package in development mode..."
pip install -e .

# Install pre-commit hooks
echo "🪝 Setting up pre-commit hooks..."
pre-commit install

# Create necessary directories
echo "📁 Creating project directories..."
mkdir -p data/{raw,processed,external}
mkdir -p models/{saved,checkpoints}
mkdir -p logs
mkdir -p reports/{figures,tables}

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📋 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your API credentials"
fi

# Initialize git hooks
echo "🔗 Initializing git hooks..."
if [ -d ".git" ]; then
    pre-commit install
else
    echo "⚠️  Not a git repository. Skipping git hooks setup."
fi

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "🐳 Docker is available"
    if command -v docker-compose &> /dev/null; then
        echo "🐙 Docker Compose is available"
        echo "🚀 You can start the development environment with: docker-compose up"
    else
        echo "⚠️  Docker Compose not found. Please install docker-compose for containerized development."
    fi
else
    echo "⚠️  Docker not found. Install Docker for containerized development."
fi

# Database setup (if PostgreSQL is available)
if command -v psql &> /dev/null; then
    echo "🗄️ PostgreSQL detected. Setting up database..."
    
    # Check if database exists
    if psql -lqt | cut -d \| -f 1 | grep -qw music_and_you; then
        echo "✅ Database 'music_and_you' already exists"
    else
        echo "📊 Creating database 'music_and_you'..."
        createdb music_and_you || echo "⚠️  Could not create database. Please create manually."
    fi
else
    echo "⚠️  PostgreSQL not found. Please install PostgreSQL or use Docker."
fi

# Jupyter setup
echo "📓 Setting up Jupyter environment..."
python -m ipykernel install --user --name=music-and-you --display-name="Music and You"

# Create initial Jupyter notebooks
if [ ! -f "notebooks/01_data_exploration.ipynb" ]; then
    echo "📝 Creating initial notebooks..."
    mkdir -p notebooks
    
    # Create basic notebook structure
    cat > notebooks/01_data_exploration.ipynb << 'EOF'
{
 "cells": [
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "# Data Exploration\n",
    "\n",
    "This notebook explores the music listening data and basic statistics."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "import pandas as pd\n",
    "import numpy as np\n",
    "import matplotlib.pyplot as plt\n",
    "import seaborn as sns\n",
    "\n",
    "from music_and_you.data import SpotifyClient\n",
    "from music_and_you.config import config\n",
    "\n",
    "# Set up plotting\n",
    "plt.style.use('seaborn-v0_8')\n",
    "sns.set_palette('husl')"
   ]
  }
 ],
 "metadata": {
  "kernelspec": {
   "display_name": "Music and You",
   "language": "python",
   "name": "music-and-you"
  },
  "language_info": {
   "codemirror_mode": {
    "name": "ipython",
    "version": 3
   },
   "file_extension": ".py",
   "mimetype": "text/x-python",
   "name": "python",
   "nbconvert_exporter": "python",
   "pygments_lexer": "ipython3",
   "version": "3.9.0"
  }
 },
 "nbformat": 4,
 "nbformat_minor": 4
}
EOF
fi

# Run tests to ensure everything is working
echo "🧪 Running initial tests..."
python -m pytest tests/ -v --tb=short || echo "⚠️  Some tests failed. This is expected in initial setup."

# Final instructions
echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your API credentials"
echo "2. Start development with: source venv/bin/activate"
echo "3. Run tests with: pytest"
echo "4. Start Jupyter with: jupyter lab"
echo "5. Start web app with: python -m music_and_you.cli serve"
echo "6. Or use Docker: docker-compose up"
echo ""
echo "📚 Documentation:"
echo "- Project README: README.md"
echo "- Literature Review: literature.MD"
echo "- API Documentation: http://localhost:8080/docs (when running)"
echo ""
echo "🔧 Development commands:"
echo "- Format code: black src/ tests/"
echo "- Lint code: flake8 src/ tests/"
echo "- Type check: mypy src/"
echo "- Run all tests: pytest"
echo "- Run specific test: pytest tests/test_spotify_client.py"
echo ""
echo "Happy coding! 🎵✨"
