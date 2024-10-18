import SettingTab from './Setting';
import ResultTab from './Result';

const XpsPlugin = {
  id: 'xps',
  title: 'XPS',
  outline: 'X-ray Photoelectron Spectroscopy (XPS)',
  version: '0.0.1',
  description: 'Handles XPS calculations and visualizations',
  SettingTab: SettingTab,
  ResultTab: ResultTab,
};

export default XpsPlugin;
