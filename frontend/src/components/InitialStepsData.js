import React from "react";
import CodeResourcesTab from "./computational_resources/CodeResourcesTab";
import BasicSettingsTab from "./workflow/BasicSettingsTab";
import AdvancedSettingsTab from "./workflow/AdvancedSettingsTab";
import StructureSelection from "./structure_selection/StructureSelection";
import LabelGroupTab from "./review_submit/LabelGroup";
import ReviewAndSubmitTab from "./review_submit/ReviewAndSubmit";
import WorkflowSummaryTab from "./results/WorkflowSummary";
import JobStatusTab from "./results/JobStatus";
import FinalStructureTab from "./results/FinalStructure";

import { lazyPluginComponent } from "./LazyPluginLoader";

export function makeInitialStepsData(pluginIds) {
  // For each pluginId, create the lazy components
  console.log("Creating initial steps data for plugins:", pluginIds);
  const pluginLazy = pluginIds.map((id) => {
    
    return {
      id,
      title: id,       // the main app should fetch the plugin metadata
      outline: id,     //
      SettingTab: lazyPluginComponent(id, "SettingTab"),
      ResultTab: lazyPluginComponent(id, "ResultTab"),
      CodeResourcesTab: lazyPluginComponent(id, "CodeResourcesTab"),
      // …any other tabs you support…
    };
  });

  return [
    {
      title: "Select Structure",
      id: "structure",
      tabs: [
        {
          id: "structure",
          title: "Structure Selection",
          content: <StructureSelection />,
        },
      ],
      dependents: [1, 2, 3],
      ButtonText: "Confirm",
      data: {},
    },
    {
      title: "Configure Workflow",
      id: "workflow_settings",
      tabs: [
        { id: "basic", title: "Basic Settings", content: <BasicSettingsTab /> },
        { id: "advanced", title: "Advanced Settings", content: <AdvancedSettingsTab /> },
        // Dynamically add plugin settings tabs:
        ...pluginLazy
          .filter((pl) => pl.SettingTab)
          .map((pl) => ({
            id: pl.id,
            title: `${pl.id} Settings`, // or use pl.title if loaded metadata
            content: React.createElement(
              React.Suspense,
              { fallback: <div>Loading {pl.id} Settings…</div> },
              React.createElement(pl.SettingTab, null)
            ),
          })),
      ],
      dependents: [2, 3],
      ButtonText: "Confirm",
      data: {
        "Basic Settings": {
          plugins: pluginLazy.map((pl) => ({
            id: pl.id,
            outline: pl.outline || "",
          })),
          properties: {},
        },
      },
    },
    {
      title: "Choose Computational Resources",
      id: "computational_resources",
      tabs: [
        {
          id: "basic",
          title: "Basic Resource Settings",
          content: <CodeResourcesTab />,
        },
        // Dynamically add plugin CodeResourcesTab:
        ...pluginLazy
          .filter((pl) => pl.CodeResourcesTab)
          .map((pl) => ({
            id: pl.id,
            title: `${pl.id} Resource Settings`,
            content: React.createElement(
              React.Suspense,
              { fallback: <div>Loading {pl.id} Resources…</div> },
              React.createElement(pl.CodeResourcesTab, null)
            ),
          })),
      ],
      dependents: [3],
      ButtonText: "Confirm",
      data: {},
    },
    {
      title: "Review and Submit",
      id: "review_submit",
      tabs: [
        { id: "submit", title: "Label and Submit", content: <LabelGroupTab /> },
        { id: "review", title: "Review Settings", content: <ReviewAndSubmitTab /> },
      ],
      dependents: [],
      ButtonText: "Confirm",
      data: {},
    },
    {
      title: "Status & Results",
      id: "status_results",
      tabs: [
        {
          id: "status",
          title: "Job Status",
          content: <JobStatusTab />,
        },
        {
          id: "structure",
          title: "Final Structure",
          content: <FinalStructureTab />,
        },
        // Dynamically add plugin ResultTab:
        ...pluginLazy.map((pl) => ({
          id: pl.id,
          title: `${pl.id} Results`,
          content: React.createElement(
            React.Suspense,
            { fallback: <div>Loading {pl.id} Results…</div> },
            React.createElement(pl.ResultTab, null)
          ),
        })),
      ],
      dependents: [],
      ButtonText: null,
      data: {},
    },
  ];
}
