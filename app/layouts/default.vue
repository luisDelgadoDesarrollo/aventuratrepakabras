<script setup lang="ts">
import { ref } from 'vue'
import {login} from "~/composables/api/authApi";
import {useAuth} from "~/composables/utils/auth";

const isOpen = ref(false)
const isMenuOpen = ref(false)

const email = ref("")
const password = ref("")
const loginError = ref("")
const { setToken,accessToken } = useAuth()


async function handleOpenLogin(){
  if(accessToken){
    await navigateTo("/admin")
  }
  else {
    isOpen.value = true
  }
}

async function handleLogin() {
  loginError.value = ""

  try {
    const token = await login({
      username: email.value,
      password: password.value
    })

    setToken(token.accessToken)

    isOpen.value = false
    await navigateTo("/admin")

  } catch (error: any) {
    if (error?.response?.status === 401) {
      loginError.value = "Usuario o contraseña incorrectos"
    } else {
      loginError.value = "Ha ocurrido un error inesperado"
    }
  }
}
</script>
<template>
  <div class="layout">
    <header class="header">
      <div class="container header-inner">
        <NuxtLink to="/" class="brand">
          <img src="/logo.png" alt="Logo" class="brand-logo" />
          <span class="brand-name">AventuraTrepakabras</span>
        </NuxtLink>

        <!-- Botón hamburguesa solo móvil -->
        <button class="menu-toggle" @click="isMenuOpen = !isMenuOpen">
          ☰
        </button>

        <nav  :class="['nav', { open: isMenuOpen }]">
          <NuxtLink to="/blog" title="Enterate de las ultimas noticias y publicaciones del club!">Blog</NuxtLink>
          <NuxtLink to="/actividades" title="¿Aun no te has apuntado a nuestras actividades? Entra y elige cual sera tu sigiente a ventura o disfruta de las actividades ya realizadas">Actividades</NuxtLink>
          <NuxtLink to="/articulos" title="¿Aun no tienes tu trepaKamiseta? ¿A que estas esperando?">Tienda</NuxtLink>
          <NuxtLink to="/secretaria" title="Enterate de como unirte a nuestro club, federarte o cualquier gestion que necesites">Secretaria</NuxtLink>
          <NuxtLink to="/contacto" title="¿Tienes cualquier duda sobre el club y como funciona? Preguntanos aqui">Contacto</NuxtLink>
          <button v-if="isMenuOpen" class="close-menu" @click="isMenuOpen = false">✕</button>
        </nav>

        <div class="login-wrapper">
          <button class="login-button" @click="handleOpenLogin">
            👤
          </button>
        </div>
      </div>
    </header>

    <div v-if="isOpen" class="modal-overlay" @click.self="isOpen = false">
      <div class="modal">
        <h2>Acceder</h2>

        <form class="modal-form" @submit.prevent="handleLogin">
          <input v-model="email" type="email" placeholder="Email" />
          <input v-model="password" type="password" placeholder="Contraseña" />

          <button type="submit" class="primary-btn">Iniciar sesión</button>
        </form>
        <button class="close-btn" @click="isOpen = false">✕</button>
        <p v-if="loginError" class="error-message">
          {{ loginError }}
        </p>
      </div>
    </div>

    <main class="main container">
      <slot />
    </main>

    <footer class="footer">
      <div class="container">
        © {{ new Date().getFullYear() }} AventuraTrepakabras
      </div>
    </footer>
  </div>
</template>

<style>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  background:
      linear-gradient(var(--layout-overlay), var(--layout-overlay)),
      var(--layout-background);

  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;

  color: var(--color-text);
}


.container {
  width: 100%;
  max-width: var(--container-width);
  margin: 0 auto;
  padding: 0 1rem;
}

.header {
  background: var(--color-primary);
  color: white;
}

.header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3rem 0;
}

.nav a {
  margin-left: 1.5rem;
  color: white;
  text-decoration: none;
  font-weight: 500;
}

.nav a.router-link-active {
  text-decoration: underline;
}

.main {
  flex: 1;
  padding: 2rem 0;
}

.footer {
  background: var(--color-secondary);
  color: white;
  padding: 1.5rem 0;
  margin-top: auto;
}
.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: white;
}

.brand-logo {
  height: 40px;
  width: auto;
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 600;
}

.layout-name {
  font-size: 1.25rem;
  font-weight: 100;
}
.login-button {
  background: transparent;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
  color: white;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: var(--radius-sm);
  width: 100%;
  max-width: 400px;
  position: relative;
}

.modal h2 {
  margin-bottom: 1rem;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-form input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.primary-btn {
  background: var(--color-primary);
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.register-link {
  margin-top: 1rem;
  font-size: 0.9rem;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1.2rem;
}

body {
  margin: 0;
}

.menu-toggle {
  display: none;
  background: transparent;
  border: none;
  font-size: 1.8rem;
  color: white;
  cursor: pointer;
}

@media (max-width: 768px) {

  .menu-toggle {
    display: block;
    z-index: 3000; /* que quede por encima */
  }

  /* NAV como menú lateral izquierdo */
  .nav {
    position: fixed;
    top: 0;
    left: 0;
    width: 80%;               /* 👈 no ocupa todo */
    max-width: 320px;         /* 👈 nunca más grande */
    height: 100vh;
    background: var(--color-primary);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;  /* 👈 alineado a la izquierda */
    padding-left: 2rem;
    gap: 2rem;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 2000;
    overflow-y: auto;         /* 👈 evita que se salga */
  }

  .nav.open {
    transform: translateX(0);
  }

  .nav a {
    font-size: 1.3rem;
    color: white;
    margin: 0;
  }

  .close-menu {
    position: absolute;
    top: 20px;
    right: 20px;
  }
}
@media (max-width: 768px) {

  .header-inner {
    position: relative;
  }

  /* Cambiamos orden visual */
  .menu-toggle {
    order: -1;          /* 👈 lo mueve a la izquierda */
    margin-right: 1rem;
  }

  .brand {
    margin-left: 0;
  }

}

.close-menu {
  position: absolute;
  top: 20px;
  right: 20px;
  background: transparent;
  border: none;
  font-size: 2rem;
  color: white;
  cursor: pointer;
}

.tooltip {
  background: var(--color-accent);
  color: var(--color-text);
}


</style>
