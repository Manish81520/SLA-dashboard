// Plain-language definitions for the onboarding pipeline's stage groups,
// sub-stages, and cross-cutting terms used across the dashboard (anomaly
// detection, focus areas, etc). Purely presentational content consumed by
// GlossaryDrawer - kept out of the component so it can be edited without
// touching any rendering logic.
//
// Keys under PIPELINE_GLOSSARY must match the group `name` and sub-stage
// `label` strings returned by the backend (STAGE_GROUPS / STAGE_CONFIG in
// main.py) - if a stage is renamed there, update the matching key here.

export const PIPELINE_GLOSSARY = {
    'Resource Requirements to Identification': {
        definition:
            'Time taken from when resource requirements are raised for a partner to when the partner is identified as a fit. Includes sourcing, initial vetting, and shortlisting activities.',
        subStages: {
            'Resource Fulfilment':
                'Time taken to assign a resource once the requirement is raised.',
        },
    },
    'Identification to Onboarding': {
        definition:
            'The core onboarding phase - from confirming a partner through background verification, regulatory registration, and documentation, up to the point they are ready for setup.',
        subStages: {
            'BGV Completion':
                "Time taken to complete the partner's background verification (BGV).",
            'FINRA Initiation Gap':
                'Time taken from resource allocation to the start of FINRA registration.',
            'FINRA Start to Courier End':
                'Time taken from FINRA registration start to completion of the courier handoff.',
            'Onboarding Docs Submission':
                'Time taken for the partner to submit onboarding documents after being assigned.',
            'Magnit Documentation':
                'Time taken to complete Magnit documentation after documents are submitted.',
            'Docs Submission to PID':
                'Time taken to receive the Project ID (PID) after documents are submitted.',
        },
    },
    'PID to Billing': {
        definition:
            'The final phase - from a partner receiving their Project ID to being fully set up and billable on the project.',
        subStages: {
            'MAC Setup':
                'Time taken to complete MAC setup after the partner receives their PID.',
        },
    },
}

// Cross-cutting concepts used throughout the dashboard (KPIs, watchlist,
// focus areas, candidate detail) rather than tied to one pipeline stage.
export const COMMON_TERMS = [
    {
        term: 'Global Average',
        definition:
            "The mean number of days it takes candidates to complete a stage, calculated fresh from the currently loaded (and filtered) dataset - there's no fixed day-count target.",
    },
    {
        term: 'Anomaly',
        definition:
            "A candidate's time in a stage that comes in more than one standard deviation above that stage's own global average - a meaningful outlier, not a missed fixed target.",
    },
    {
        term: 'Focus Area',
        definition:
            "A candidate still in progress on a stage who has already used 75% or more of that stage's average duration, but hasn't crossed the anomaly line yet - an early warning before it becomes an anomaly.",
    },
    {
        term: 'Anomaly Watchlist',
        definition:
            'A ranked list of every candidate/stage anomaly across the dataset, worst deviation first.',
    },
    {
        term: 'Team vs. Global Average',
        definition:
            "How a specific project team's average for a stage compares to the dataset-wide average for that same stage.",
    },
    {
        term: 'Data Quality Issue',
        definition:
            'A stage value that fell outside the plausible 0-365 day range in the source data (almost always a parsing artifact). These are excluded from averages rather than skewing them, and are called out separately.',
    },
    {
        term: 'On Track / At Risk / Overdue',
        definition:
            "A candidate's predicted status on their current stage: On Track (under 75% of the stage average used), At Risk (75% or more used but not yet over), or Overdue (already past the stage average).",
    },
]
