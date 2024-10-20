import React, { useEffect, useRef } from 'react';
import { Atoms, WEAS } from 'weas';

function StructureViewer({ structure }) {
  const weasContainerRef = useRef(null);

  useEffect(() => {
    if (!structure) {
        return;
    }
    // if structure is a object, convert it to Atoms object
    if (typeof structure === 'object') {
      console.log("structure", structure);
      // remove species from structure
      delete structure.species;
      structure = new Atoms(structure);
    }
    if (weasContainerRef.current) {
      // Create an instance of AtomsViewer and pass the Atoms object to it
      weasContainerRef.current.innerHTML = ""; // Clear the container when unmounting
      const editor = new WEAS({ domElement: weasContainerRef.current });
      editor.avr.atoms = structure;
      editor.render();

      return () => {
        // Clean up the viewer when the component unmounts or updates
        
      };
    }
  }, [structure]);

  return (
    <div
      ref={weasContainerRef}
      style={{
        position: 'relative',
        width: '600px',
        height: '400px',
        border: '1px solid #ddd'
      }}
    ></div>
  );
}

export default StructureViewer;
