# Project Structure - nfl-betting

## Memory Context
This document is part of the NFL Sports Betting Prediction App project, providing a detailed overview of the project's file organization. It connects with other project documents such as the Requirements, Tech Stack, and Implementation guides, ensuring consistency across the project. It informs developers and maintainers about the directory layout necessary for efficient development, deployment, and maintenance.

- **Informs:** Requirements, Tech Stack, Implementation, Dependencies, Project Overview
- **Informed by:** Development practices, deployment strategies, API integrations
- **Dependencies:** Python scripts, data storage files, API clients, Discord bot code

## Version History

| Date       | Editor        | Changes                                            | Memory Update Status |
|------------|---------------|----------------------------------------------------|----------------------|
| 2024-04-27 | [Your Name]   | Initial creation of project structure documentation | Complete             |

## Content Summary
This document maps the directory hierarchy for the nfl-betting project, explaining the rationale behind each folder and file arrangement. It aims to facilitate clarity, maintainability, and scalability of the codebase.

---

## 1. Root Directory
```plaintext
/nfl-betting/
├── README.md
├── requirements.txt
├── config/
│   ├── api_keys.yaml
│   └── settings.yaml
├── data/
│   ├── raw/
│   ├── processed/
│   └── models/
├── src/
│   ├── api_clients/
│   ├── data_collection/
│   ├── prediction/
│   ├── discord_bot/
│   └── utils/
├── notebooks/
│   └── data_analysis.ipynb
├── tests/
│   └── test_main.py
└── scripts/
    └── run_prediction.py
```

---

## 2. Directory Explanations

### `/nfl-betting/`
- **Purpose:** Root folder containing all project components, documentation, and configuration files.

### `/README.md`
- **Purpose:** Overview of the project, setup instructions, and usage guidelines.

### `/requirements.txt`
- **Purpose:** List of Python dependencies required for the project.

### `/config/`
- **Purpose:** Store configuration files such as API keys and system settings.
- **Files:**
  - `api_keys.yaml`: Stores API keys for NFL APIs, odds data providers, etc.
  - `settings.yaml`: General app settings, environment variables.

### `/data/`
- **Purpose:** Data storage segregated by processing stage.
- **Subfolders:**
  - `raw/`: Raw data fetched from APIs.
  - `processed/`: Cleaned and feature-engineered data for modeling.
  - `models/`: Saved prediction models and related artifacts.

### `/src/`
- **Purpose:** Source code for core functionalities.
- **Subfolders:**
  - `api_clients/`: Scripts to query NFL APIs and odds providers.
  - `data_collection/`: Scripts for data collection, cleaning, and storage.
  - `prediction/`: Model training, prediction generation, and evaluation.
  - `discord_bot/`: Bot code to send predictions to Discord channels.
  - `utils/`: Utility functions (e.g., logging, helpers).

### `/notebooks/`
- **Purpose:** Jupyter notebooks for exploratory data analysis and model prototyping.
- **Example:** `data_analysis.ipynb`

### `/tests/`
- **Purpose:** Automated tests for code validation.
- **Example:** `test_main.py`

### `/scripts/`
- **Purpose:** Standalone scripts for running key processes.
- **Example:** `run_prediction.py`

---

## 3. Rationale for Structure
- **Modularity:** Separating API clients, data handling, models, and Discord integration supports maintainability.
- **Scalability:** Clear segregation allows for easy expansion (e.g., adding new data sources or models).
- **Clarity:** Organized directories reduce confusion and streamline onboarding for new developers.
- **Version Control:** Easy to track changes at the folder/file level.

---

## 4. Next Steps
- Create the directory structure in your repository.
- Populate the README with project-specific details.
- Configure environment settings and API keys.
- Develop scripts within the respective folders, following the outlined organization.

---

## 5. Self-Critique
- **Strengths:** Clear, logical separation of concerns; facilitates collaboration and maintenance.
- **Weaknesses:** May need adaptation as the project grows; consider adding folders for documentation or deployment scripts.
- **Potential Improvements:** Incorporate versioning for models; add a 'docs/' directory for documentation.

---

## 6. Memory System Notes
This structure aligns with the Windsurf methodology by enabling easy updates and reference across project phases. It should be maintained consistently and updated during major refactors or when adding new features.

---

*End of "Project Structure" documentation.*