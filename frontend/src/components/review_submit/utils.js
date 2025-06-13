

export const accumulateData = (steps, includeStructure = true, useId = true) => {
    return Array.isArray(steps)
      ? steps.reduce((acc, step) => {
          const key = useId ? step.id : step.title;
          if (key === 'structure') {
            if (includeStructure) {
              acc[key] = step.data;
            }
          } else {
            acc[key] = step.data;
          }
          return acc;
        }, {})
      : {};
  };
