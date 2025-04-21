# Dependencies Documentation for AutoML Project

## Overview
This document outlines the dependencies required for the successful execution and development of the AutoML project. It covers both software libraries and tools necessary for building, running, and testing the AutoML system.

## Software Dependencies

### Programming Language
- **Python 3.8 or higher**: The core language used for developing the AutoML project. Ensure that Python is installed and included in the system's PATH.

### Python Libraries
The following Python libraries are essential for the AutoML project:

- **scikit-learn >= 0.24.0**: A library for machine learning that provides simple and efficient tools for data mining and data analysis.
- **pandas >= 1.2.0**: Used for data manipulation and analysis, providing data structures like DataFrames.
- **numpy >= 1.19.0**: A fundamental package for scientific computing with Python, used for handling arrays and matrices.
- **matplotlib >= 3.3.0**: A plotting library for creating static, interactive, and animated visualizations.
- **seaborn >= 0.11.0**: A data visualization library based on matplotlib, providing a high-level interface for drawing attractive statistical graphics.
- **hyperopt >= 0.2.5**: Used for optimizing hyperparameters in machine learning models.
- **xgboost >= 1.3.0**: An optimized distributed gradient boosting library designed to be highly efficient, flexible, and portable.
- **lightgbm >= 3.1.0**: A gradient boosting framework that uses tree-based learning algorithms, designed for distributed and efficient training.
- **tensorflow >= 2.4.0**: An end-to-end open-source platform for machine learning, useful for deep learning tasks.
- **keras >= 2.4.0**: A high-level neural networks API, written in Python and capable of running on top of TensorFlow.
- **pytest >= 6.0.0**: A testing framework to write simple and scalable test cases.

### Additional Tools
- **Jupyter Notebook >= 6.1.0**: An open-source web application that allows you to create and share documents that contain live code, equations, visualizations, and narrative text.
- **Docker >= 19.03.0**: Used for containerizing applications, ensuring consistency across different development and production environments.
- **Git >= 2.28.0**: Version control system to track changes in source code during software development.

## Installation Instructions

### Setting Up the Python Environment
1. **Install Python**: Ensure Python 3.8 or higher is installed. You can download it from [python.org](https://www.python.org/downloads/).
2. **Create a Virtual Environment**:
   ```bash
   python3 -m venv automl-env
   source automl-env/bin/activate  # On Windows use `automl-env\Scripts\activate`
   ```

### Installing Required Libraries
Activate the virtual environment and install the necessary libraries using pip:

```bash
pip install scikit-learn pandas numpy matplotlib seaborn hyperopt xgboost lightgbm tensorflow keras pytest
```

### Installing Additional Tools
- **Jupyter Notebook**: Install via pip:
  ```bash
  pip install notebook
  ```
- **Docker**: Follow the installation guide on the [Docker website](https://docs.docker.com/get-docker/).
- **Git**: Download and install from [git-scm.com](https://git-scm.com/).

## Dependency Management
To ensure consistency across different environments, use a `requirements.txt` file to manage Python dependencies. Generate or update this file with the following command:

```bash
pip freeze > requirements.txt
```

## Version Control
Ensure that all dependencies and configuration files are tracked under version control using Git. Regularly commit changes and use branches for feature development to maintain a stable main branch.

## Environment Configuration
- **Environment Variables**: Configure necessary environment variables for sensitive information (e.g., API keys) and system paths. Use a `.env` file and load it using `python-dotenv`:
  ```bash
  pip install python-dotenv
  ```

## Conclusion
This documentation provides a comprehensive overview of the dependencies required for the AutoML project. Adhering to these guidelines ensures a smooth development process and a consistent environment across different stages of the project lifecycle.