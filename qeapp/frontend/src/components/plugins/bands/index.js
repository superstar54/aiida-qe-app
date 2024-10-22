import SettingTab from './Setting';
import ResultTab from './Result';

const BandsPlugin = {
  id: 'bands',
  title: 'Bands',
  outline: 'Bands Structure',
  version: '0.0.1',
  description: 'Handles band structure calculations and visualizations.',
  SettingTab: SettingTab,
  ResultTab: ResultTab,
};

export default BandsPlugin;
