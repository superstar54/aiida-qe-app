

def get_tab_value(data):
    parameters = {"nscf_kpoints_distance": data["kPointsDistance"],
                          "use_pdos_degauss": data["usePdosDegauss"],
                          "pdos_degauss": data["pdosDegauss"],
                          }
    return parameters