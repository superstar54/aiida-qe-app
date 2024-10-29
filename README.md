# QE App
[![PyPI version](https://badge.fury.io/py/qeapp-react.svg)](https://badge.fury.io/py/qeapp-react)
[![Unit test](https://github.com/aiidateam/qeapp-react/actions/workflows/ci.yaml/badge.svg)](https://github.com/aiidateam/qeapp-react/actions/workflows/ci.yaml)
[![codecov](https://codecov.io/gh/superstar54/qeapp-react/branch/main/graph/badge.svg)](https://codecov.io/gh/superstar54/qeapp-react)
[![Docs status](https://readthedocs.org/projects/qeapp-react/badge)](http://qeapp-react.readthedocs.io/)

Efficiently design and manage flexible workflows with AiiDA, featuring an interactive GUI, checkpoints, provenance tracking, error-resistant, and remote execution capabilities.



## Installation

```console
    pip install qeapp-react
```

To install the latest version from source, first clone the repository and then install using `pip`:

```console
git clone https://github.com/aiidateam/qeapp-react
cd qeapp-react
pip install -e .
```

To install the jupyter widget support you need to in addition build the JavaScript packages:

```console
pip install .[widget]
# build widget
cd aiida_workgraph/widget/
npm install
npm run build
# build web frontend
cd ../../aiida_workgraph/web/frontend/
npm install
npm run build
```


## License
[MIT](http://opensource.org/licenses/MIT)
