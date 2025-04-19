Thank you for the detailed clarifications. Based on your inputs, I will now generate the **User Flow** documentation for your project **"mlb-betting"**. This will map out the key user interactions with your system, focusing on how casual bettors and enthusiasts will experience the app, receive predictions, and interact with the Discord bot.

---

# User Flow for **mlb-betting**

## Overview

This user flow describes the typical journey of a user interacting with the MLB player props betting prediction system, focusing on receiving predictions via Discord, without initial user input commands. The flow emphasizes automated data collection, prediction generation, and notification delivery.

---

## User Flow Diagram

```mermaid
flowchart TD
    A[Start: User joins Discord server] --> B[System initializes and connects to Discord]
    B --> C[Periodic scheduled task triggers data collection]
    C --> D[Collect MLB player stats from APIs]
    D --> E[Retrieve latest betting odds data]
    E --> F[Run ML models to generate player prop predictions]
    F --> G[Generate confidence scores and justifications]
    G --> H[Send predictions and insights as Discord messages]
    H --> I[User receives notifications in designated channel]
    I --> J[Optional: User interacts with commands (future feature)]
    J --> K[System logs the prediction delivery]
    K --> L[End or wait for next scheduled cycle]
```

---

## Detailed User Flow Description

### 1. System Initialization
- The Discord bot connects to a designated server and channel.
- It verifies API keys, dependencies, and scheduled tasks are active.

### 2. Scheduled Data Collection
- At predefined intervals (e.g., every 10 minutes), a background job triggers.
- It queries multiple MLB data sources (balldontlie.io, NBA APIs, Fantasy APIs) to gather up-to-date player and team stats.
- It queries live odds data from sources like OddsAPI, Betfair, DraftKings, or FanDuel (via APIs or scraping).

### 3. Data Processing & Prediction
- The collected data is pre-processed (cleaned, normalized).
- The ML models (Random Forest, XGBoost, etc.) run predictions on player props, generating expected values and confidence levels.
- Additional justifications or explanations are compiled for transparency.

### 4. Notification Generation
- The system formats predictions into user-friendly messages.
- Each message includes:
  - Player name and prop (e.g., "Mike Trout: Over 1.5 HRs")
  - Predicted outcome and confidence score
  - Brief justification or trend insight
  - Optional: betting odds or suggested action

### 5. Sending Notifications
- The bot posts the predictions in a dedicated Discord channel.
- Messages are timestamped and include relevant links or disclaimers ("For entertainment purposes only").

### 6. User Interaction (Future Expansion)
- Users may interact with commands like `!props`, `!odds`, or `!rec` for specific info.
- The bot responds with tailored data or additional insights.

### 7. Logging & Monitoring
- Each prediction delivery is logged for audit and improvement.
- System monitors for errors or data inconsistencies, alerting maintainers if needed.

---

## User Interaction Summary
- **Primary Experience:** Users passively receive predictions and insights via scheduled messages.
- **Future enhancements:** Command-based queries for personalized tips, filtering by team/player, or historical trends.

---

## Self-Critique & Improvement Plan
- **Strengths:** Clear automation flow, minimal user effort, timely updates.
- **Weaknesses:** Limited initial user interaction, reliance on data source consistency.
- **Next steps:** Enable user commands, add feedback mechanisms, improve explanation clarity.

---

Would you like me to generate the full formal documentation text for this user flow, or do you prefer a summarized version?