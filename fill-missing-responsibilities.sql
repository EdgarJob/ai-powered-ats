-- Fill in missing responsibilities for jobs
UPDATE jobs
SET responsibilities = 
    CASE 
        WHEN title ILIKE '%software%' OR title ILIKE '%developer%' OR title ILIKE '%engineer%' THEN 
            '- Design and develop software applications
- Write clean, maintainable, and efficient code
- Collaborate with cross-functional teams
- Troubleshoot and debug applications
- Implement new features and improvements'
            
        WHEN title ILIKE '%data%' AND title ILIKE '%scientist%' THEN
            '- Analyze large datasets to identify trends
- Develop machine learning models
- Create data visualizations
- Collaborate with stakeholders to understand requirements
- Present findings and make recommendations'
            
        WHEN title ILIKE '%product%' AND title ILIKE '%manager%' THEN
            '- Define product vision, strategy and roadmap
- Gather and prioritize product requirements
- Work with engineering teams to deliver features
- Analyze market trends and competition
- Conduct user research and usability testing'
            
        WHEN title ILIKE '%design%' OR title ILIKE '%ui%' OR title ILIKE '%ux%' THEN
            '- Create wireframes, mockups and prototypes
- Design intuitive user interfaces
- Conduct user research and testing
- Collaborate with developers on implementation
- Ensure brand consistency across all interfaces'
            
        WHEN title ILIKE '%devops%' THEN
            '- Set up and maintain CI/CD pipelines
- Configure and manage cloud infrastructure
- Implement monitoring and alerting systems
- Automate deployment processes
- Troubleshoot infrastructure issues'
            
        WHEN title ILIKE '%marketing%' THEN
            '- Develop and execute marketing campaigns
- Create content for various digital channels
- Analyze campaign performance metrics
- Manage social media presence
- Collaborate with design and product teams'
            
        WHEN title ILIKE '%hr%' OR title ILIKE '%human%resource%' THEN
            '- Recruit and hire qualified candidates
- Develop and implement HR policies
- Manage employee relations and concerns
- Administer benefits and compensation programs
- Support organizational development initiatives'
            
        WHEN title ILIKE '%finance%' OR title ILIKE '%financial%' OR title ILIKE '%analyst%' THEN
            '- Prepare financial reports and forecasts
- Analyze business performance metrics
- Support budgeting and planning processes
- Identify trends and provide insights
- Make recommendations to improve financial performance'
            
        WHEN title ILIKE '%sales%' THEN
            '- Identify and pursue sales opportunities
- Build and maintain client relationships
- Prepare and deliver product demonstrations
- Negotiate contracts and close deals
- Meet or exceed sales targets'
            
        WHEN title ILIKE '%support%' OR title ILIKE '%customer%' THEN
            '- Respond to customer inquiries via multiple channels
- Troubleshoot and resolve customer issues
- Document all customer interactions
- Identify common problems and suggest improvements
- Escalate complex issues when necessary'
            
        ELSE
            '- Collaborate with team members on projects
- Communicate effectively with stakeholders
- Meet deadlines and quality standards
- Identify and resolve issues promptly
- Contribute to team objectives and goals'
    END
WHERE responsibilities IS NULL OR responsibilities = ''; 