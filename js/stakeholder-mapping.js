/**
 * Stakeholder Mapping Tool
 * A modular implementation for mapping and visualizing stakeholders
 */

// Main application controller
const StakeholderApp = {
    // Data model
    data: {
        stakeholders: [],
        relationships: [],
        selectedStakeholder: null
    },
    
    // Initialize the application
    init() {
        this.bindElements();
        this.bindEvents();
        this.UI.updateStakeholdersList();
        this.UI.updateRelationshipDropdown();
    },
    
    // Bind DOM elements
    bindElements() {
        this.elements = {
            stakeholderForm: document.getElementById('stakeholderForm'),
            stakeholderList: document.getElementById('stakeholderList'),
            relationsSelect: document.getElementById('relations'),
            matrixContainer: document.getElementById('matrixContainer'),
            networkContainer: document.getElementById('networkContainer'),
            tooltip: document.getElementById('tooltip'),
            contextMenu: document.getElementById('contextMenu'),
            saveDataBtn: document.getElementById('saveData'),
            loadDataBtn: document.getElementById('loadData'),
            clearDataBtn: document.getElementById('clearData'),
            exportMatrixBtn: document.getElementById('exportMatrix'),
            exportNetworkBtn: document.getElementById('exportNetwork'),
            exportReportBtn: document.getElementById('exportReport'),
            analysisContent: document.getElementById('analysisContent'),
            tabBtns: document.querySelectorAll('.tab-btn'),
            tabContents: document.querySelectorAll('.tab-content')
        };
    },
    
    // Bind event listeners
    bindEvents() {
        // Tab navigation
        this.elements.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.handleTabChange(btn));
        });
        
        // Form submission
        this.elements.stakeholderForm.addEventListener('submit', e => this.handleFormSubmit(e));
        
        // Data management
        this.elements.saveDataBtn.addEventListener('click', () => this.DataManager.saveData());
        this.elements.loadDataBtn.addEventListener('click', () => this.DataManager.loadData());
        this.elements.clearDataBtn.addEventListener('click', () => this.DataManager.clearData());
        
        // Export functions
        this.elements.exportMatrixBtn.addEventListener('click', () => this.ExportManager.exportMatrix());
        this.elements.exportNetworkBtn.addEventListener('click', () => this.ExportManager.exportNetwork());
        this.elements.exportReportBtn.addEventListener('click', () => this.ExportManager.exportReport());
    },
    
    // Handle tab changes
    handleTabChange(btn) {
        const tab = btn.dataset.tab;
        
        // Update active tab button
        this.elements.tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update active tab content
        this.elements.tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tab}-tab`) {
                content.classList.add('active');
            }
        });
        
        // Refresh visualizations when switching to their tabs
        if (tab === 'matrix') {
            this.Visualizations.renderPowerInterestMatrix();
        } else if (tab === 'network') {
            this.Visualizations.renderRelationshipNetwork();
        } else if (tab === 'analysis') {
            this.Visualizations.renderAnalysis();
        }
    },
    
    // Handle form submission
    handleFormSubmit(e) {
        e.preventDefault();
        
        // Get form values
        const formData = {
            name: document.getElementById('name').value.trim(),
            role: document.getElementById('role').value,
            power: document.getElementById('power').value,
            interest: document.getElementById('interest').value,
            influence: document.getElementById('influence').value,
            notes: document.getElementById('notes').value.trim()
        };
        
        // Get selected relations
        const selectedOptions = Array.from(this.elements.relationsSelect.selectedOptions)
            .map(option => option.value);
        
        // Add stakeholder
        this.addStakeholder(formData, selectedOptions);
        
        // Reset form
        this.elements.stakeholderForm.reset();
    },
    
    // Add a new stakeholder
    addStakeholder(formData, relations) {
        // Create stakeholder object
        const newStakeholder = {
            id: Date.now().toString(),
            ...formData
        };
        
        // Add to the data model
        this.data.stakeholders.push(newStakeholder);
        
        // Create relationships
        relations.forEach(relatedId => {
            this.data.relationships.push({
                source: newStakeholder.id,
                target: relatedId
            });
        });
        
        // Update UI
        this.UI.updateStakeholdersList();
        this.UI.updateRelationshipDropdown();
        
        // Refresh visualizations if needed
        this.refreshActiveVisualizations();
        
        // Show success message
        alert(`Added stakeholder: ${newStakeholder.name}`);
    },
    
    // Edit an existing stakeholder
    editStakeholder(stakeholder) {
        // Fill the form with stakeholder data
        document.getElementById('name').value = stakeholder.name;
        document.getElementById('role').value = stakeholder.role;
        document.getElementById('power').value = stakeholder.power;
        document.getElementById('interest').value = stakeholder.interest;
        document.getElementById('influence').value = stakeholder.influence;
        document.getElementById('notes').value = stakeholder.notes;
        
        // Select related stakeholders
        const relatedIds = this.data.relationships
            .filter(rel => rel.source === stakeholder.id || rel.target === stakeholder.id)
            .map(rel => rel.source === stakeholder.id ? rel.target : rel.source);
        
        Array.from(this.elements.relationsSelect.options).forEach(option => {
            option.selected = relatedIds.includes(option.value);
        });
        
        // Delete the existing stakeholder
        this.deleteStakeholder(stakeholder.id, false);
        
        // Scroll to the form
        this.elements.stakeholderForm.scrollIntoView({ behavior: 'smooth' });
    },
    
    // Delete a stakeholder
    deleteStakeholder(id, confirm = true) {
        if (confirm && !window.confirm('Are you sure you want to delete this stakeholder?')) {
            return;
        }
        
        // Remove from data model
        this.data.stakeholders = this.data.stakeholders.filter(s => s.id !== id);
        this.data.relationships = this.data.relationships.filter(r => r.source !== id && r.target !== id);
        
        // Update UI
        this.UI.updateStakeholdersList();
        this.UI.updateRelationshipDropdown();
        
        // Refresh visualizations if needed
        this.refreshActiveVisualizations();
        
        // Close context menu
        this.UI.closeContextMenu();
    },
    
    // Refresh active visualizations
    refreshActiveVisualizations() {
        if (document.getElementById('matrix-tab').classList.contains('active')) {
            this.Visualizations.renderPowerInterestMatrix();
        }
        if (document.getElementById('network-tab').classList.contains('active')) {
            this.Visualizations.renderRelationshipNetwork();
        }
        if (document.getElementById('analysis-tab').classList.contains('active')) {
            this.Visualizations.renderAnalysis();
        }
    },
    
    // UI Management Module
    UI: {
        // Update the stakeholders list in the sidebar
        updateStakeholdersList() {
            const listElement = StakeholderApp.elements.stakeholderList;
            listElement.innerHTML = '';
            
            StakeholderApp.data.stakeholders.forEach(stakeholder => {
                const card = document.createElement('div');
                card.className = 'stakeholder-card';
                card.dataset.id = stakeholder.id;
                
                // Create badges
                const powerClass = stakeholder.power === 'high' ? 'badge-high-power' : 'badge-low-power';
                const interestClass = stakeholder.interest === 'high' ? 'badge-high-interest' : 'badge-low-interest';
                
                card.innerHTML = `
                    <h3>${stakeholder.name}</h3>
                    <p>Role: ${Utilities.capitalizeFirstLetter(stakeholder.role)}</p>
                    <div>
                        <span class="badge ${powerClass}">${Utilities.capitalizeFirstLetter(stakeholder.power)} Power</span>
                        <span class="badge ${interestClass}">${Utilities.capitalizeFirstLetter(stakeholder.interest)} Interest</span>
                        <span class="badge">${Utilities.capitalizeFirstLetter(stakeholder.influence)} Influence</span>
                    </div>
                `;
                
                // Add event listeners
                card.addEventListener('click', () => this.selectStakeholder(stakeholder));
                card.addEventListener('contextmenu', (e) => this.showContextMenu(e, stakeholder));
                
                listElement.appendChild(card);
            });
        },
        
        // Update relationship dropdown
        updateRelationshipDropdown() {
            const selectElement = StakeholderApp.elements.relationsSelect;
            selectElement.innerHTML = '';
            
            StakeholderApp.data.stakeholders.forEach(stakeholder => {
                const option = document.createElement('option');
                option.value = stakeholder.id;
                option.textContent = stakeholder.name;
                selectElement.appendChild(option);
            });
        },
        
        // Select a stakeholder
        selectStakeholder(stakeholder) {
            StakeholderApp.data.selectedStakeholder = stakeholder;
            
            // Highlight the selected card
            document.querySelectorAll('.stakeholder-card').forEach(card => {
                if (card.dataset.id === stakeholder.id) {
                    card.style.outline = '2px solid var(--color-accent)';
                } else {
                    card.style.outline = 'none';
                }
            });
            
            // Show details tooltip
            const card = document.querySelector(`.stakeholder-card[data-id="${stakeholder.id}"]`);
            if (card) {
                const rect = card.getBoundingClientRect();
                const tooltip = StakeholderApp.elements.tooltip;
                
                tooltip.innerHTML = `
                    <h3>${stakeholder.name}</h3>
                    <p><strong>Role:</strong> ${Utilities.capitalizeFirstLetter(stakeholder.role)}</p>
                    <p><strong>Power:</strong> ${Utilities.capitalizeFirstLetter(stakeholder.power)}</p>
                    <p><strong>Interest:</strong> ${Utilities.capitalizeFirstLetter(stakeholder.interest)}</p>
                    <p><strong>Influence:</strong> ${Utilities.capitalizeFirstLetter(stakeholder.influence)}</p>
                    ${stakeholder.notes ? `<p><strong>Notes:</strong> ${stakeholder.notes}</p>` : ''}
                `;
                
                tooltip.style.left = `${rect.left + window.scrollX}px`;
                tooltip.style.top = `${rect.bottom + window.scrollY + 10}px`;
                tooltip.style.opacity = '1';
                
                // Hide tooltip after 3 seconds
                setTimeout(() => {
                    tooltip.style.opacity = '0';
                }, 3000);
            }
        },
        
        // Show context menu
        showContextMenu(e, stakeholder) {
            e.preventDefault();
            e.stopPropagation();
            
            const contextMenu = StakeholderApp.elements.contextMenu;
            
            // Position the menu
            contextMenu.style.display = 'block';
            contextMenu.style.left = `${e.pageX}px`;
            contextMenu.style.top = `${e.pageY}px`;
            
            // Set selected stakeholder
            StakeholderApp.data.selectedStakeholder = stakeholder;
            
            // Add event listeners
            document.querySelector('[data-action="edit"]').onclick = () => 
                StakeholderApp.editStakeholder(stakeholder);
                
            document.querySelector('[data-action="delete"]').onclick = () => 
                StakeholderApp.deleteStakeholder(stakeholder.id);
            
            // Click outside to close
            document.addEventListener('click', this.closeContextMenu);
        },
        
        // Close context menu
        closeContextMenu() {
            StakeholderApp.elements.contextMenu.style.display = 'none';
            document.removeEventListener('click', StakeholderApp.UI.closeContextMenu);
        }
    },
    
    // Visualization Module
    Visualizations: {
        // Create stakeholder nodes with positioned coordinates based on their attributes
        createStakeholderNodes(width, height) {
            return StakeholderApp.data.stakeholders.map(s => ({
                id: s.id,
                name: s.name,
                role: s.role,
                power: s.power,
                interest: s.interest,
                influence: s.influence,
                x: s.power === 'high' ? width * 0.6 + Math.random() * (width * 0.3) : width * 0.1 + Math.random() * (width * 0.3),
                y: s.interest === 'high' ? height * 0.6 + Math.random() * (height * 0.3) : height * 0.1 + Math.random() * (height * 0.3)
            }));
        },
        
        // Render the Power-Interest Matrix
        renderPowerInterestMatrix() {
            const matrixContainer = StakeholderApp.elements.matrixContainer;
            
            if (StakeholderApp.data.stakeholders.length === 0) {
                matrixContainer.innerHTML = '<p style="text-align: center; padding: 20px;">Add stakeholders to see the matrix.</p>';
                return;
            }
            
            // Clear previous visualization
            matrixContainer.innerHTML = '';
            
            // Create SVG element
            const svg = d3.select('#matrixContainer')
                .append('svg')
                .attr('width', '100%')
                .attr('height', '100%');
            
            // Get dimensions
            const width = matrixContainer.clientWidth;
            const height = matrixContainer.clientHeight;
            
            // Define quadrant labels
            const quadrants = [
                { x: width * 0.25, y: height * 0.25, label: 'MONITOR\n(Low Power, Low Interest)', position: 'bottom-left' },
                { x: width * 0.75, y: height * 0.25, label: 'KEEP SATISFIED\n(High Power, Low Interest)', position: 'bottom-right' },
                { x: width * 0.25, y: height * 0.75, label: 'KEEP INFORMED\n(Low Power, High Interest)', position: 'top-left' },
                { x: width * 0.75, y: height * 0.75, label: 'MANAGE CLOSELY\n(High Power, High Interest)', position: 'top-right' }
            ];
            
            // Draw quadrant lines
            svg.append('line')
                .attr('x1', 0)
                .attr('y1', height / 2)
                .attr('x2', width)
                .attr('y2', height / 2)
                .attr('stroke', 'white')
                .attr('stroke-width', 1);
            
            svg.append('line')
                .attr('x1', width / 2)
                .attr('y1', 0)
                .attr('x2', width / 2)
                .attr('y2', height)
                .attr('stroke', 'white')
                .attr('stroke-width', 1);
            
            // Add quadrant labels
            quadrants.forEach(q => {
                const textElement = svg.append('text')
                    .attr('x', q.x)
                    .attr('y', q.y)
                    .attr('text-anchor', 'middle')
                    .attr('fill', 'rgba(255,255,255,0.7)')
                    .style('font-size', '12px');
                
                // Split the label into multiple lines
                const lines = q.label.split('\n');
                lines.forEach((line, i) => {
                    textElement.append('tspan')
                        .attr('x', q.x)
                        .attr('dy', i ? '1.2em' : 0)
                        .text(line);
                });
            });
            
            // Add axis labels
            svg.append('text')
                .attr('x', width / 2)
                .attr('y', 15)
                .attr('text-anchor', 'middle')
                .attr('fill', 'white')
                .text('Power');
            
            svg.append('text')
                .attr('x', 15)
                .attr('y', height / 2)
                .attr('transform', `rotate(-90, 15, ${height/2})`)
                .attr('text-anchor', 'middle')
                .attr('fill', 'white')
                .text('Interest');
            
            // Create stakeholder nodes
            const nodes = this.createStakeholderNodes(width, height);
            
            // Create circles for stakeholders
            const nodeElements = svg.selectAll('circle')
                .data(nodes)
                .enter()
                .append('circle')
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)
                .attr('r', 15)
                .attr('fill', d => {
                    if (d.power === 'high' && d.interest === 'high') return 'var(--color-high-power)';
                    if (d.power === 'high' && d.interest === 'low') return 'var(--color-low-interest)';
                    if (d.power === 'low' && d.interest === 'high') return 'var(--color-high-interest)';
                    return 'var(--color-low-power)';
                })
                .attr('stroke', 'white')
                .attr('stroke-width', 1)
                .style('cursor', 'pointer');
            
            // Add labels for stakeholders
            const textElements = svg.selectAll('text.label')
                .data(nodes)
                .enter()
                .append('text')
                .attr('class', 'label')
                .attr('x', d => d.x)
                .attr('y', d => d.y + 25)
                .attr('text-anchor', 'middle')
                .attr('fill', 'white')
                .style('font-size', '10px')
                .style('pointer-events', 'none')
                .text(d => d.name);
            
            // Add drag behavior
            const drag = d3.drag()
                .on('start', (event, d) => this.matrixDragStarted(event, d, svg))
                .on('drag', (event, d) => this.matrixDragged(event, d, width, height, svg))
                .on('end', (event, d) => this.matrixDragEnded(event, d, svg));
            
            nodeElements.call(drag);
            
            // Add tooltips
            this.addNodeTooltips(nodeElements);
        },
        
        // Drag handlers for matrix
        matrixDragStarted(event, d, svg) {
            d3.select(event.sourceEvent.target)
                .raise()
                .attr('stroke', 'var(--color-accent)')
                .attr('stroke-width', 2);
        },
        
        matrixDragged(event, d, width, height, svg) {
            // Constrain to the matrix boundaries
            const x = Math.max(20, Math.min(width - 20, event.x));
            const y = Math.max(20, Math.min(height - 20, event.y));
            
            d.x = x;
            d.y = y;
            
            // Update circle position
            d3.select(event.sourceEvent.target)
                .attr('cx', x)
                .attr('cy', y);
            
            // Update text position
            svg.select(`text.label[x="${d.x}"][y="${d.y + 25}"]`)
                .attr('x', x)
                .attr('y', y + 25);
        },
        
        matrixDragEnded(event, d, svg) {
            d3.select(event.sourceEvent.target)
                .attr('stroke', 'white')
                .attr('stroke-width', 1);
            
            // Update stakeholder's power and interest based on position
            const stakeholder = StakeholderApp.data.stakeholders.find(s => s.id === d.id);
            if (stakeholder) {
                const container = StakeholderApp.elements.matrixContainer;
                const width = container.clientWidth;
                const height = container.clientHeight;
                
                stakeholder.power = d.x > width / 2 ? 'high' : 'low';
                stakeholder.interest = d.y > height / 2 ? 'high' : 'low';
                
                // Update the UI
                StakeholderApp.UI.updateStakeholdersList();
            }
        },
        
        // Render Relationship Network
        renderRelationshipNetwork() {
            const networkContainer = StakeholderApp.elements.networkContainer;
            
            if (StakeholderApp.data.stakeholders.length === 0) {
                networkContainer.innerHTML = '<p style="text-align: center; padding: 20px;">Add stakeholders to see the network.</p>';
                return;
            }
            
            // Clear previous visualization
            networkContainer.innerHTML = '';
            
            // Create SVG element
            const svg = d3.select('#networkContainer')
                .append('svg')
                .attr('width', '100%')
                .attr('height', '100%');
            
            // Get dimensions
            const width = networkContainer.clientWidth;
            const height = networkContainer.clientHeight;
            
            // Create a force simulation
            const simulation = d3.forceSimulation()
                .force('link', d3.forceLink().id(d => d.id).distance(100))
                .force('charge', d3.forceManyBody().strength(-200))
                .force('center', d3.forceCenter(width / 2, height / 2))
                .force('collision', d3.forceCollide().radius(30));
            
            // Create links
            const links = StakeholderApp.data.relationships.map(r => ({
                source: r.source,
                target: r.target
            }));
            
            // Create nodes
            const nodes = StakeholderApp.data.stakeholders.map(s => ({
                id: s.id,
                name: s.name,
                role: s.role,
                power: s.power,
                interest: s.interest,
                influence: s.influence
            }));
            
            // Add links to SVG
            const link = svg.append('g')
                .selectAll('line')
                .data(links)
                .enter()
                .append('line')
                .attr('stroke', 'rgba(255,255,255,0.6)')
                .attr('stroke-width', 1);
            
            // Create node groups
            const node = svg.append('g')
                .selectAll('.node')
                .data(nodes)
                .enter()
                .append('g')
                .attr('class', 'node')
                .call(d3.drag()
                    .on('start', (event, d) => this.networkDragStarted(event, d, simulation))
                    .on('drag', (event, d) => this.networkDragged(event, d))
                    .on('end', (event, d) => this.networkDragEnded(event, d, simulation)));
            
            // Add circles to nodes
            node.append('circle')
                .attr('r', 15)
                .attr('fill', d => Utilities.getRoleColor(d.role))
                .attr('stroke', 'white')
                .attr('stroke-width', 1);
            
            // Add text labels
            node.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', 30)
                .attr('fill', 'white')
                .style('font-size', '10px')
                .text(d => d.name);
            
            // Add tooltips
            this.addNodeTooltips(node);
            
            // Update positions on simulation tick
            simulation.nodes(nodes).on('tick', () => {
                link
                    .attr('x1', d => d.source.x)
                    .attr('y1', d => d.source.y)
                    .attr('x2', d => d.target.x)
                    .attr('y2', d => d.target.y);
                
                node
                    .attr('transform', d => `translate(${d.x},${d.y})`);
            });
            
            simulation.force('link').links(links);
            
            // Add legend
            this.addNetworkLegend(svg);
        },
        
        // Drag handlers for network
        networkDragStarted(event, d, simulation) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        },
        
        networkDragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        },
        
        networkDragEnded(event, d, simulation) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        },
        
        // Add tooltips to nodes
        addNodeTooltips(nodeSelection) {
            nodeSelection.on('mouseover', function(event, d) {
                const stakeholder = StakeholderApp.data.stakeholders.find(s => s.id === d.id);
                const tooltip = StakeholderApp.elements.tooltip;
                
                tooltip.innerHTML = `
                    <h3>${stakeholder.name}</h3>
                    <p><strong>Role:</strong> ${Utilities.capitalizeFirstLetter(stakeholder.role)}</p>
                    <p><strong>Power:</strong> ${Utilities.capitalizeFirstLetter(stakeholder.power)}</p>
                    <p><strong>Interest:</strong> ${Utilities.capitalizeFirstLetter(stakeholder.interest)}</p>
                    <p><strong>Influence:</strong> ${Utilities.capitalizeFirstLetter(stakeholder.influence)}</p>
                    ${stakeholder.notes ? `<p><strong>Notes:</strong> ${stakeholder.notes}</p>` : ''}
                `;
                
                tooltip.style.left = `${event.pageX + 10}px`;
                tooltip.style.top = `${event.pageY + 10}px`;
                tooltip.style.opacity = '1';
            });
            
            nodeSelection.on('mouseout', function() {
                StakeholderApp.elements.tooltip.style.opacity = '0';
            });
        },
        
        // Add legend to network visualization
        addNetworkLegend(svg) {
            const legend = svg.append('g')
                .attr('transform', 'translate(20, 20)');
            
            const roles = ['internal', 'external', 'customer', 'supplier', 'regulator', 'community', 'other'];
            
            roles.forEach((role, i) => {
                const g = legend.append('g')
                    .attr('transform', `translate(0, ${i * 20})`);
                
                g.append('circle')
                    .attr('r', 6)
                    .attr('fill', Utilities.getRoleColor(role));
                
                g.append('text')
                    .attr('x', 15)
                    .attr('y', 4)
                    .attr('fill', 'white')
                    .style('font-size', '10px')
                    .text(Utilities.capitalizeFirstLetter(role));
            });
        },
        
        // Render Analysis
        renderAnalysis() {
            const analysisContent = StakeholderApp.elements.analysisContent;
            
            if (StakeholderApp.data.stakeholders.length === 0) {
                analysisContent.innerHTML = '<p>Add stakeholders to see analysis.</p>';
                return;
            }
            
            // Calculate statistics
            const stats = this.calculateStats();
            
            // Create chart
            this.createRoleDistributionChart(stats.roleDistribution);
            
            // Generate insights
            const insights = this.generateInsights(stats);
            
            // Display insights
            analysisContent.innerHTML = insights;
        },
        
        // Calculate statistics for analysis
        calculateStats() {
            const stakeholders = StakeholderApp.data.stakeholders;
            
            // Power distribution
            const powerDistribution = {
                high: stakeholders.filter(s => s.power === 'high').length,
                low: stakeholders.filter(s => s.power === 'low').length
            };
            
            // Interest distribution
            const interestDistribution = {
                high: stakeholders.filter(s => s.interest === 'high').length,
                low: stakeholders.filter(s => s.interest === 'low').length
            };
            
            // Role distribution
            const roleDistribution = {};
            stakeholders.forEach(s => {
                roleDistribution[s.role] = (roleDistribution[s.role] || 0) + 1;
            });
            
            // Influence distribution
            const influenceDistribution = {
                direct: stakeholders.filter(s => s.influence === 'direct').length,
                indirect: stakeholders.filter(s => s.influence === 'indirect').length
            };
            
            // Quadrant counts
            const quadrantCounts = {
                monitorCount: stakeholders.filter(s => s.power === 'low' && s.interest === 'low').length,
                keepSatisfiedCount: stakeholders.filter(s => s.power === 'high' && s.interest === 'low').length,
                keepInformedCount: stakeholders.filter(s => s.power === 'low' && s.interest === 'high').length,
                manageCloselyCount: stakeholders.filter(s => s.power === 'high' && s.interest === 'high').length
            };
            
            return {
                powerDistribution,
                interestDistribution,
                roleDistribution,
                influenceDistribution,
                quadrantCounts
            };
        },
        
        // Create a chart for role distribution
        createRoleDistributionChart(roleDistribution) {
            const ctx = document.getElementById('stakeholderChart').getContext('2d');
            
            // Safely destroy previous chart if it exists
    if (window.stakeholderChart instanceof Chart) {
        window.stakeholderChart.destroy();
    }
            
            // Prepare data
            const roleLabels = Object.keys(roleDistribution).map(role => 
                Utilities.capitalizeFirstLetter(role));
                
            const roleData = Object.values(roleDistribution);
            
            // Sort by count for better visualization
            const combined = roleLabels.map((label, i) => ({
                label, 
                value: roleData[i]
            }));
            
            combined.sort((a, b) => b.value - a.value);
            
            const sortedLabels = combined.map(item => item.label);
            const sortedData = combined.map(item => item.value);
            
            // Create chart
            window.stakeholderChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: sortedLabels,
                    datasets: [{
                        label: 'Stakeholders by Role',
                        data: sortedData,
                        backgroundColor: sortedLabels.map(role => 
                            Utilities.getRoleColor(role.toLowerCase())),
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: 'white'
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: 'white'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: 'white'
                            }
                        }
                    }
                }
            });
        },
        
        // Generate insights based on stakeholder data
        generateInsights(stats) {
            const { quadrantCounts, powerDistribution, interestDistribution } = stats;
            
            let insights = '';
            
            // Quadrant distribution
            insights += `<h3>Stakeholder Distribution:</h3>`;
            insights += `<ul>`;
            insights += `<li><strong>Monitor (Low Power, Low Interest):</strong> ${quadrantCounts.monitorCount} stakeholders</li>`;
            insights += `<li><strong>Keep Satisfied (High Power, Low Interest):</strong> ${quadrantCounts.keepSatisfiedCount} stakeholders</li>`;
            insights += `<li><strong>Keep Informed (Low Power, High Interest):</strong> ${quadrantCounts.keepInformedCount} stakeholders</li>`;
            insights += `<li><strong>Manage Closely (High Power, High Interest):</strong> ${quadrantCounts.manageCloselyCount} stakeholders</li>`;
            insights += `</ul>`;
            
            // Strategic recommendations
            insights += `<h3>Strategic Recommendations:</h3>`;
            insights += `<ul>`;
            
            if (quadrantCounts.manageCloselyCount > 0) {
                insights += `<li>Prioritize engagement with the ${quadrantCounts.manageCloselyCount} high power, high interest stakeholders</li>`;
            }
            
            if (quadrantCounts.keepSatisfiedCount > 0) {
                insights += `<li>Keep the ${quadrantCounts.keepSatisfiedCount} high power, low interest stakeholders satisfied with regular updates</li>`;
            }
            
            if (quadrantCounts.keepInformedCount > 0) {
                insights += `<li>Keep the ${quadrantCounts.keepInformedCount} high interest stakeholders informed about progress</li>`;
            }
            
            if (quadrantCounts.monitorCount > 0) {
                insights += `<li>Monitor the ${quadrantCounts.monitorCount} low power, low interest stakeholders with minimal effort</li>`;
            }
            
            if (powerDistribution.high > powerDistribution.low) {
                insights += `<li>Be aware that your project has more high-power stakeholders (${powerDistribution.high}) than low-power ones (${powerDistribution.low})</li>`;
            }
            
            if (interestDistribution.high > interestDistribution.low) {
                insights += `<li>There is strong interest in your project with ${interestDistribution.high} highly interested stakeholders</li>`;
            }
            
            insights += `</ul>`;
            
            return insights;
        }
    },
    
    // Data Management Module
    DataManager: {
        // Save data to local storage
        saveData() {
            const data = {
                stakeholders: StakeholderApp.data.stakeholders,
                relationships: StakeholderApp.data.relationships
            };
            
            try {
                localStorage.setItem('stakeholderData', JSON.stringify(data));
                alert('Data saved successfully!');
            } catch (error) {
                alert('Error saving data: ' + error.message);
            }
        },
        
        // Load data from local storage
        loadData() {
            try {
                const data = localStorage.getItem('stakeholderData');
                
                if (!data) {
                    alert('No saved data found.');
                    return;
                }
                
                const parsedData = JSON.parse(data);
                
                StakeholderApp.data.stakeholders = parsedData.stakeholders || [];
                StakeholderApp.data.relationships = parsedData.relationships || [];
                
                StakeholderApp.UI.updateStakeholdersList();
                StakeholderApp.UI.updateRelationshipDropdown();
                
                // Refresh visualizations if needed
                StakeholderApp.refreshActiveVisualizations();
                
                alert('Data loaded successfully!');
            } catch (error) {
                alert('Error loading data: ' + error.message);
            }
        },
        
        // Clear all data
        clearData() {
            if (window.confirm('Are you sure you want to clear all stakeholder data? This cannot be undone.')) {
                StakeholderApp.data.stakeholders = [];
                StakeholderApp.data.relationships = [];
                
                StakeholderApp.UI.updateStakeholdersList();
                StakeholderApp.UI.updateRelationshipDropdown();
                
                // Refresh visualizations if needed
                StakeholderApp.refreshActiveVisualizations();
                
                alert('All data cleared!');
            }
        }
    },
    
    // Export Manager Module
    ExportManager: {
        // Export matrix as PNG
        exportMatrix() {
            if (StakeholderApp.data.stakeholders.length === 0) {
                alert('Add stakeholders to export the matrix.');
                return;
            }
            
            this.exportSvgAsPng(StakeholderApp.elements.matrixContainer, 'stakeholder-matrix.png');
        },
        
        // Export network as PNG
        exportNetwork() {
            if (StakeholderApp.data.stakeholders.length === 0) {
                alert('Add stakeholders to export the network.');
                return;
            }
            
            this.exportSvgAsPng(StakeholderApp.elements.networkContainer, 'stakeholder-network.png');
        },
        
        // Export report as text
        exportReport() {
            if (StakeholderApp.data.stakeholders.length === 0) {
                alert('Add stakeholders to export the report.');
                return;
            }
            
            // Create a text report
            let report = 'STAKEHOLDER ANALYSIS REPORT\n';
            report += '==========================\n\n';
            
            report += 'STAKEHOLDER LIST:\n';
            StakeholderApp.data.stakeholders.forEach(s => {
                report += `- ${s.name} (${Utilities.capitalizeFirstLetter(s.role)})\n`;
                report += `  Power: ${Utilities.capitalizeFirstLetter(s.power)}, Interest: ${Utilities.capitalizeFirstLetter(s.interest)}, Influence: ${Utilities.capitalizeFirstLetter(s.influence)}\n`;
                if (s.notes) {
                    report += `  Notes: ${s.notes}\n`;
                }
                report += '\n';
            });
            
            report += 'RELATIONSHIPS:\n';
            StakeholderApp.data.relationships.forEach(r => {
                const source = StakeholderApp.data.stakeholders.find(s => s.id === r.source);
                const target = StakeholderApp.data.stakeholders.find(s => s.id === r.target);
                if (source && target) {
                    report += `- ${source.name} is related to ${target.name}\n`;
                }
            });
            
            report += '\nANALYSIS:\n';
            report += StakeholderApp.elements.analysisContent.textContent.replace(/\n\s+/g, '\n');
            
            // Create a download link
            const blob = new Blob([report], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'stakeholder-analysis-report.txt';
            a.click();
            
            URL.revokeObjectURL(url);
        },
        
        // Helper function to export SVG as PNG
        exportSvgAsPng(container, filename) {
            const svg = container.querySelector('svg');
            
            if (!svg) {
                alert('No visualization found to export.');
                return;
            }
            
            // Create a canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas dimensions
            const rect = svg.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            
            // Convert SVG to data URL
            const data = new XMLSerializer().serializeToString(svg);
            const svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);
            
            // Create image and draw on canvas
            const img = new Image();
            img.onload = function() {
                ctx.fillStyle = '#2a2a2a';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                URL.revokeObjectURL(url);
                
                // Convert canvas to PNG and download
                const pngUrl = canvas.toDataURL('image/png');
                const a = document.createElement('a');
                a.href = pngUrl;
                a.download = filename;
                a.click();
            };
            
            img.src = url;
        }
    }
};

// Utilities Module
const Utilities = {
    // Capitalize first letter of a string
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    
    // Get color based on role
    getRoleColor(role) {
        const colors = {
            internal: '#FF9500',
            external: '#00AAFF',
            customer: '#FF5733',
            supplier: '#33FF57',
            regulator: '#5733FF',
            community: '#FF33A8',
            other: '#A8A8A8'
        };
        
        return colors[role] || '#A8A8A8';
    }
};

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    StakeholderApp.init();
});