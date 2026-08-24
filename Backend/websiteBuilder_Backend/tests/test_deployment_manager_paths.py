import unittest
from pathlib import Path
from uuid import uuid4

from app.deployment_manager import DeploymentManager


class DeploymentManagerPathTests(unittest.TestCase):
    def test_uses_project_virtualenv_when_present(self):
        manager = DeploymentManager.__new__(DeploymentManager)
        project_root = Path(__file__).resolve().parents[3]
        venv_python = project_root / ".venv" / "bin" / "python"
        venv_uvicorn = project_root / ".venv" / "bin" / "uvicorn"

        self.assertTrue(venv_python.exists(), "Expected the project virtualenv to exist")
        self.assertEqual(manager.get_python_path(), str(venv_python))
        self.assertEqual(manager.get_uvicorn_path(), str(venv_uvicorn))


if __name__ == "__main__":
    unittest.main()
