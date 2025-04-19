# Project Structure Documentation for "mlb-betting"

## Memory Context
This document is part of the "mlb-betting" project memory bank, capturing the overall architecture and file organization. It references the data collection scripts, ML prediction modules, API integrations, and Discord bot components. It informs related documents such as requirements specifications and deployment plans.

### Dependencies
- Python libraries: requests, pandas, scikit-learn, xgboost, lightgbm, discord.py, dotenv
- External APIs: ballDontLie.io, SportRadar, OddsAPI, Betfair, DraftKings/FanDuel (scraped)
- Model artifacts: trained ML models stored as pickle files

## Version History
| Date       | Editor       | Changes                                  | Memory Update Status |
|------------|--------------|------------------------------------------|----------------------|
| 2024-04-27 | [Your Name]  | Initial project structure documentation   | Complete             |

---

## 1. Root Directory (`mlb-betting/`)
Contains the main project folder.
- README.md
- requirements.txt
- .env
- `.gitignore`

## 2. Subdirectories

### 2.1 `data/`
Stores raw and processed data files.
- `raw/` : Downloaded data from APIs before processing.
- `processed/` : Cleaned and feature-engineered datasets.
- `external/` : Third-party datasets or auxiliary data.

### 2.2 `scripts/`
Contains Python scripts for data collection, processing, modeling, and automation.
- `data_collection/` : Scripts to query MLB APIs and odds sources.
  - `collect_player_stats.py`
  - `collect_live_odds.py`
- `model/` : ML training and inference scripts.
  - `train_model.py`
  - `predict.py`
- `discord_bot/` : Discord bot code.
  - `bot.py`
  - `commands.py`
- `utils/` : Utility functions.
  - `api_helpers.py`
  - `data_helpers.py`
  - `logging_config.py`

### 2.3 `models/`
Stores trained model files.
- `player_props_model.pkl`
- `model_metadata.json`

### 2.4 `config/`
Configuration files.
- `api_keys.env` (not committed, for API keys)
- `config.yaml` (any config parameters)

### 2.5 `docs/`
Project documentation files.
- `architecture.md`
- `api_usage.md`
- `deployment.md`

### 2.6 `tests/`
Test scripts for unit testing.
- `test_data_helpers.py`
- `test_model.py`
- `test_discord_bot.py`

---

## 3. Organizational Rationale
- **Separation of concerns:** Data collection, models, and bot code are in distinct directories.
- **Ease of maintenance:** Clear folder structure simplifies updates and troubleshooting.
- **Scalability:** Additional scripts or models can be added without restructuring.
- **Security:** API keys stored in `.env` and excluded from version control.

---

## 4. Naming Conventions
- Python scripts use snake_case.
- Models stored as `.pkl` files with descriptive names.
- Configuration files in YAML or ENV format.
- Documentation files in Markdown.

---

## 5. Build & Deployment
- Development occurs locally with scripts in `scripts/`.
- Deployment to cloud (AWS Lambda, Render, etc.) involves containerizing or packaging relevant scripts.
- Automation via cron jobs or CI/CD pipelines triggers data collection, model training, and bot updates.
- Discord bot hosted on a server with continuous running, using `bot.py` as entry point.

---

## 6. Summary
This directory structure supports a modular, scalable, and maintainable architecture for "mlb-betting". It aligns with best practices for Python projects involving data workflows, ML models, and integrations with external APIs and platforms like Discord.

---

Would you like me to generate further documentation sections, such as detailed "Requirements" or "Tech Stack"?