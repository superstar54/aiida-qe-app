import SettingTab from './Setting';
import ResultTab from './Result';
import CodeResourcesTab from './CodeResources';

const BandsPlugin = {
  id: 'bands',
  title: 'Bands',
  outline: 'Bands Structure',
  version: '0.0.1',
  description: 'Handles band structure calculations and visualizations.',
  SettingTab: SettingTab,
  ResultTab: ResultTab,
  CodeResourcesTab: CodeResourcesTab,
};

export default BandsPlugin;
