# Interactive Stakeholder Mapping Tool

An interactive web application that helps visualize and analyze stakeholder relationships. This tool allows users to map stakeholders based on power and interest, analyze their relationships, and generate meaningful insights for project planning.

## Features

- **Interactive Stakeholder Management**: Add, edit, and delete stakeholders with their attributes
- **Power-Interest Matrix**: Visualize stakeholders in a quadrant-based matrix
- **Relationship Network**: View connections between stakeholders through an interactive force-directed graph
- **Statistical Analysis**: Get insights into stakeholder distribution and strategic recommendations
- **Data Persistence**: Save and load stakeholder maps through browser local storage
- **Export Options**: Export visualizations as PNG and analysis reports as text

## Getting Started

### Prerequisites

This is a vanilla JavaScript application that requires no build process. You only need:
- A modern web browser
- A text editor (VS Code recommended)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/stakeholder-mapping-tool.git
```

2. Open the project folder:
```bash
cd stakeholder-mapping-tool
```

3. Open `index.html` in your browser or use a local server:
```bash
# If you have Python installed:
python -m http.server  # Then open http://localhost:8000
```

## Usage

1. **Add Stakeholders**: Create stakeholders by filling out the form with details like name, role, power level, interest level, and influence type
2. **View Matrix**: Switch to the Power-Interest Matrix tab to see stakeholders positioned according to their power and interest
3. **Analyze Relationships**: Use the Relationship Network tab to visualize connections between stakeholders
4. **Get Insights**: Check the Analysis tab for stakeholder distribution and recommendations
5. **Save Your Work**: Use the Save Data button to store your stakeholder map locally

## Technical Details

The application is built using:
- Vanilla JavaScript with a modular architecture
- D3.js for force-directed network visualization
- Chart.js for data visualization
- Browser local storage for data persistence

## Inspiration

This tool was inspired by the host attribute management system from HBO's Westworld series, adapting its approach to visualizing attributes for stakeholder analysis. The core principles of power and interest mapping have been enhanced with interactive capabilities and relationship visualization.

## Future Plans

- Tracking stakeholder satisfaction over project lifecycle
- Multiple project support
- User accounts and cloud storage
- Collaboration features for team-based stakeholder analysis
- Integration with project management tools

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- The creators of D3.js and Chart.js for their powerful visualization libraries
- The functional programming principles from "Grokking Simplicity" that informed the code architecture