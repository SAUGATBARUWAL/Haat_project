export const COLORS = {
    // Main green
    green: "#166534",
    greenDark: "#14532D",
    greenLight: "#DCFCE7",

    // Existing names kept so the rest of your components
    // don't need to be rewritten
    indigo: "#166534",
    indigoDeep: "#14532D",

    // Accent
    marigold: "#BBF7D0",

    // Backgrounds
    paper: "#F6FBF7",
    paperRaised: "#FFFFFF",

    // Text
    ink: "#17231A",
    inkSoft: "#647067",

    // Borders
    hairline: "#DDE8DF",

    // Status colors
    sage: "#16A34A",
    brick: "#DC2626",

    // Extra green shades
    greenMedium: "#22C55E",
    greenPale: "#F0FDF4",
};


/*
|--------------------------------------------------------------------------
| RIDER TABS
|--------------------------------------------------------------------------
*/

export const TABS = [
    {
        key: "active",
        label: "Active",
    },
    {
        key: "rider_assigned",
        label: "Assigned",
    },
    {
        key: "out_for_delivery",
        label: "Out for delivery",
    },
    {
        key: "delivered",
        label: "Delivered",
    },
];


/*
|--------------------------------------------------------------------------
| ORDER STATUS LABELS
|--------------------------------------------------------------------------
*/

export const STATUS_LABEL = {
    pending: "Pending",
    packaging: "Packaging",
    rider_assigned: "Assigned",
    out_for_delivery: "Out for delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
};


/*
|--------------------------------------------------------------------------
| ORDER STATUS STYLES
|--------------------------------------------------------------------------
*/

export const STATUS_STYLE = {
    pending: {
        background: "#FEF3C7",
        color: "#92400E",
    },

    packaging: {
        background: "#FEF3C7",
        color: "#92400E",
    },

    rider_assigned: {
        background: "#DCFCE7",
        color: "#166534",
    },

    out_for_delivery: {
        background: "#D1FAE5",
        color: "#047857",
    },

    delivered: {
        background: "#DCFCE7",
        color: "#15803D",
    },

    cancelled: {
        background: "#FEE2E2",
        color: "#B91C1C",
    },
};