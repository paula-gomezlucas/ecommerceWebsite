// Agregar un evento al hacer click en el botón de Iniciar Sesión
document.getElementById("btn-login").addEventListener("click", async (event) => {

    // detenemos la ejecución
    event.preventDefault();

    // seleccionamos los datos de login que introduce el usuario
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // seleccionamos el p donde vamos a indicar en caso de que el lodgin sea incorrecto
    const errorMessage = document.getElementById("error-message");

    // Borramos el mensaje de error si el usuario vuelve a clicar
    errorMessage.textContent = "";

    // consultar las credenciales a través de la API de usuarios
    try {

        // preparamos los datos de login
        const loginData ={};
        loginData.username = username;
        loginData.password = password;

        // convertimos los datos a JSON
        const bodyData = JSON.stringify(loginData);

        // Hacemos la petición a la API
        const response = await fetch("http://localhost:3000/api/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: bodyData
        });

        // leemos la respuesta del servidor
        const data = await response.json();

        console.log("Mensaje: ", data.message);
        console.log("Usuario: ", data.username);
        console.log("Rol: ", data.role);
        console.log("Error: ", data.error);

        // Si la API me devuelve error, el login ha fallado
        if (data.error !== undefined){

            // Mostramos el mensaje de error en la web
            errorMessage.textContent = data.error;

            return;
        }

        // Si el login es correcto, almacenamos el username en localStorage
        localStorage.setItem("username", data.username);

        // redireccionamos según rol
        if (data.role === "admin") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "user.html";
        }
                
    } catch {
        errorMessage.textContent = data.error;
        // errorMessage.textContent = "No se puede conectar con el servidor";
    }
});

// REGISTRO DE NUEVO USUARIO
document.getElementById("btn-register").addEventListener("click", async (event) =>{

    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const errorMessage = document.getElementById("error-message");
    errorMessage.textContent = "";

    try {

        const registerData = {
            username: username,
            password: password
        };

        // Enviamos la petición a la API de registro
        const response = await fetch("http://localhost:3000/api/users/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(registerData)
        });
        
        const data = await response.json();

        // Si la API devuelve error
        if (data.error !== undefined){
            errorMessage.textContent = data.error;
            return;
        }

        // si la API devuelve success
        errorMessage.style.color = "green";
        errorMessage.textContent = "Usuario registrado correctamente. Por favor inicia sesión con tus nuevas credenciales.";

        // Borramos los campos rellenados por el usuario
        document.getElementById("username").value = "";
        document.getElementById("password").value = "";

    } catch (error) {
        errorMessage.textContent = data.error;
        
    }
});
