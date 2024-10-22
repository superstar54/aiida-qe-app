
def get_tab_value(xps_settings):
    """
    Get the tab value
    """
    parameters = {"structure_type": xps_settings["structureType"],
                  "pseudo_group": xps_settings["pseudoGroup"],
                  "correction_energies": xps_settings["correctionEnergies"],
                  "core_level_list": [key for key, value in xps_settings["coreLevels"].items() if value],
                }
    return parameters