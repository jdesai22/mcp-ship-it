# Project Structure - nba-betting

## Memory Context
This document defines the organization of the "nba-betting" project, ensuring clarity and consistency across development, deployment, and maintenance. It links to related documents such as data source schemas, machine learning model descriptions, API integration guides, and deployment procedures.

## Version History

| Date       | Editor          | Changes                                              | Memory Update Status |
|------------|-----------------|------------------------------------------------------|----------------------|
| 2024-04-27 | [Your Name]     | Initial creation of project structure documentation  | Complete             |

## Project Directory Structure

```plaintext
nba-betting/
│
├── data/
│   ├── raw/                     # Raw data fetched from NBA APIs and live odds sources
│   ├── processed/               # Cleaned and feature-engineered data
│   └── models/                  # Saved machine learning models and training artifacts
│
├── src/
│   ├── api_clients/             # Modules for interfacing with NBA and odds APIs
│   │   ├── nba_api_client.py
│   │   ├── odds_api_client.py
│   │   └── utils.py               # Utility functions for API handling
│   │
│   ├── data_processing/         # Data cleaning, transformation, feature engineering
│   │   ├── data_cleaning.py
│   │   ├── feature_engineering.py
│   │   └── data_utils.py
│   │
│   ├── models/                  # Model training, evaluation, prediction scripts
│   │   ├── train_model.py
│   │   ├── evaluate_model.py
│   │   └── predict.py
│   │
│   ├── bot/                     # Discord bot integration and command handling
│   │   ├── bot.py
│   │   └── handlers.py
│   │
│   ├── notifications/           # Sending predictions and suggestions via Discord
│   │   ├── discord_sender.py
│   │   └── schedule_tasks.py
│   │
│   └── main.py                  # Entry point for orchestrating data fetch, model inference, and messaging
│
├── config/
│   ├── api_keys.yaml             # API credentials for NBA and odds APIs
│   ├── model_params.yaml          # Parameters for models and thresholds
│   └── config.yaml                # General configuration settings
│
├── logs/
│   └── app.log                    # Application logs for debugging and audit trail
│
├── docs/
│   └── (Generated documentation files)
│
└── README.md                      # Project overview and setup instructions
```

## Explanation of Organizational Rationale

- **data/**: Separates raw API data from processed datasets, facilitating reproducibility and version control.
- **src/**: Contains all source code, organized by functionality (API clients, data processing, models, bot interactions).
- **config/**: Keeps sensitive info and configurable parameters modular and easily adjustable.
- **logs/**: Maintains logs for debugging, monitoring, and auditing.
- **docs/**: Stores auto-generated or manually maintained documentation aligned with Windsurf standards.
- **README.md**: Provides quick start instructions and project overview.

## Next Steps

- Populate each folder with initial template files.
- Set up version control (git) with appropriate .gitignore.
- Document API keys and configuration parameters securely.
- Establish a development workflow for continuous integration and deployment.

## Memory System Notes

This directory structure aligns with the project’s goal of modular, maintainable code. All major components (API interaction, data pipeline, ML models, bot) are isolated to facilitate testing and updates. The structure will evolve as the project progresses, with documentation updated accordingly.

---

If you'd like, I can generate more detailed sub-structures, naming conventions, or explain relationships between modules.