import SettingTab from './Setting';
import ResultTab from './Result';
import CodeResourcesTab from './CodeResources';

const PdosPlugin = {
  id: 'pdos',
  title: 'PDOS',
  outline: 'Projected Density of States (PDOS)',
  version: '0.0.1',
  description: 'Handles PDOS calculations and visualizations',
  SettingTab: SettingTab,
  ResultTab: ResultTab,
  CodeResourcesTab: CodeResourcesTab,
};

export default PdosPlugin;
