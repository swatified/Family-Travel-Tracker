# Family Travel Tracker using Postgres

### Overview
Family Travel Tracker is an interactive web application designed to bring your family's travel adventures to life on a dynamic world map. It allows each family member to visually track the countries they've visited by highlighting them in a personalized color. With just a few clicks, users can add family members, select their unique color, and mark off countries from their travel bucket lists. Built with Node.js, Express, EJS, and Postgres, this app provides a seamless and engaging experience to help families cherish their travel memories in a visually stunning way.

### Screenshots
![teal](https://i.ibb.co/HdspGKN/Screenshot-2024-09-22-182411.png)
![green](https://i.ibb.co/H2R4LfW/Screenshot-2024-09-22-181747.png)

```mermaid
graph LR;
    A[Tech Stack] --> B[Backend]
    A --> C[Frontend]
    A --> D[Database]
    A --> E[Map]

    B --> B1[Node.js]
    B --> B2[Express]

    C --> C1[EJS (Embedded JavaScript)]
    C --> C2[HTML]
    C --> C3[CSS]

    D --> D1[Postgres]

    E --> E1[SVG-based world map for country highlights]
