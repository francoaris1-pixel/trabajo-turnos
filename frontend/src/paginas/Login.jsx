import react, { useState } from 'react';
import './Login.css';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        // evita que se recarge sola la pagina
    };
    console.log(email, password);

    return (
        <div className="login-pantalla">
            <div className="login-tarjetas">
                <div className="login-encabezado">
                    <h2>sistema de turnos</h2>
                    </div>

                    <form onSubmit={handleLogin} className="login-formulario">
                    <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        placeholder="Ingrese su correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="login-cuerpo">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Ingrese su contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                
                <button type="submit" className="btn-ingresar">
                    Ingresar
                </button>
            </form>

            <div className="login-pie">   
            <p>¿No tienes una cuenta? <a href="/register">Regístrate</a></p>
         </div>
        </div>
    </div>
    );
}
export default Login;