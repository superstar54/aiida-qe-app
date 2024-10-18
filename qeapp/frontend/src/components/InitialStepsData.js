import BasicSettingsTab from './workflow/BasicSettingsTab';
import AdvancedSettingsTab from './workflow/AdvancedSettingsTab';
import StructureSelection from './structure_selection/StructureSelection';
import CodeResourcesTab from './computational_resources/CodeResourcesTab';
import LabelGroupTab from './review_submit/LabelGroup';
import ReviewAndSubmitTab from './review_submit/ReviewAndSubmit';
import WorkflowSummaryTab from './results/WorkflowSummary';
import JobStatusTab from './results/JobStatus';
import FinalStructureTab from './results/FinalStructure';
// Import the dynamically discovered plugins
import plugins from './plugins';

// Define steps and their dependent steps
const initialStepsData = [
    {
      title: 'Select Structure',
      id: "structure",
      tabs: [
        {
          id: "structure",
          title: "Structure Selection", 
          content: <StructureSelection />
        },
      ],
      dependents: [1, 2, 3],
      ButtonText: "Confirm",
      data: {}
    },
    {
      title: 'Configure Workflow',
      id: "workflow_settings",
      tabs: [
        { id: "basic", title: 'Basic Settings', content: <BasicSettingsTab /> },
        { id: "advanced", title: 'Advanced Settings', content: <AdvancedSettingsTab /> },
        // Dynamically add plugin settings tabs
        ...plugins
        .filter(plugin => plugin.SettingTab) // Only include plugins with SettingTab
        .map(plugin => ({
          id: plugin.id,
          title: `${plugin.title} Settings`,
          content: <plugin.SettingTab />
        })),
      ],
      dependents: [2, 3],
      ButtonText: "Confirm",
      // retrieve the name and outlne of the plugins
      data: {"Basic Settings": {"plugins": plugins
                                          .filter(plugin => plugin.SettingTab) // Only include plugins with SettingTab
                                          .map(plugin => ({id: plugin.id, outline: plugin.outline})),
                                "properties": {}}}
    },
    {
      title: 'Choose Computational Resources',
      id: "computational_resources",
      tabs: [
        { id: "basic", title: 'Basic Resource Settings', content: <CodeResourcesTab /> },
        // Conditionally add plugin settings tabs
        ...plugins
        .filter(plugin => plugin.CodeResourcesTab) // Only include plugins with CodeResourcesTab
        .map(plugin => ({
          id: plugin.id,
          title: `${plugin.title} Resource Settings`,
          content: <plugin.CodeResourcesTab />
        })),
      ],
      dependents: [3],
      ButtonText: "Confirm",
      data: {}
    },
    {
      title: 'Review and Submit',
      id: "review_submit",
      tabs: [
        { id: "submit", title: 'Label and Submit', content: <LabelGroupTab /> },
        { id: "review", title: 'Review Settings', content: <ReviewAndSubmitTab /> },  // The review step shows all data.
      ],
      dependents: [],
      ButtonText: "Confirm",
      data: {}
    },
    {
      title: 'Status & Results',
      id: "status_results",
      tabs: [
        { id: "status", title: 'Job Status', content: <JobStatusTab /> },
        { id: "structure", title: 'Final Structure', content: <FinalStructureTab /> },
        // Dynamically add plugin results tabs
        ...plugins.map(plugin => ({
          id: plugin.id,
          title: `${plugin.title} Results`,
          content: <plugin.ResultTab />
        })),
        // { title: 'Workflow summary', content: <WorkflowSummaryTab /> },
      ],
      dependents: [],
      ButtonText: null,
      data: {}
    }
  ];

export default initialStepsData;