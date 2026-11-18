**Crear un entorno virtual**: Abre la terminal en la raíz del repositorio y genera un directorio para aislar las dependencias.
```Bash
python -m venv venv
```


**Activar el entorno**: Ejecuta el comando cada vez que abras una nueva terminal para compilar o editar los documentos.
```Bash
source venv/bin/activate
```
o
```Bash
source venv/bin/activate.fish
```
_Verificación_: El texto de tu terminal ahora debe mostrar un prefijo (venv) a la izquierda.


**Instalar el framework y el tema**: Al instalar el tema Material, se descargará automáticamente el núcleo de MkDocs como dependencia.
```Bash
pip install mkdocs-material
```


**Verificar la instalación**: Confirma que el binario de MkDocs está en tu ruta activa.
```Bash
mkdocs --version
```


**Compilar y previsualizar**: La configuración está en `.mkdocs/mkdocs.yml` (MkDocs no permite usar como `docs_dir` la misma carpeta del archivo de configuración). Desde la raíz del repositorio:
```Bash
mkdocs serve -f .mkdocs/mkdocs.yml
```
```Bash
mkdocs build -f .mkdocs/mkdocs.yml
```
El sitio compilado se genera fuera del repositorio, en `../SiCoIn-documentation-site`.
