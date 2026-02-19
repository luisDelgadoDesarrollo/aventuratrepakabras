<script setup lang="ts">
import { ref } from "vue"
import { login } from "~/composables/api/authApi"
import { useAuth } from "~/composables/utils/auth"

const isOpen = ref(false)
const isMenuOpen = ref(false)
const email = ref("")
const password = ref("")
const loginError = ref("")

const { setToken, accessToken } = useAuth()

const navLinks = [
  {
    to: "/blog",
    label: "Blog",
    title: "Enterate de las ultimas noticias y publicaciones del club"
  },
  {
    to: "/actividades",
    label: "Actividades",
    title: "Consulta actividades futuras y revisa las actividades ya realizadas"
  },
  {
    to: "/articulos",
    label: "Tienda",
    title: "Descubre la tienda del club"
  },
  {
    to: "/secretaria",
    label: "Secretaria",
    title: "Informacion sobre altas, federaciones y tramites"
  },
  {
    to: "/contacto",
    label: "Contacto",
    title: "Contacta con el club para resolver cualquier duda"
  }
]

async function handleOpenLogin() {
  if (accessToken.value) {
    await navigateTo("/admin")
    return
  }
  isOpen.value = true
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
      loginError.value = "Usuario o contrasena incorrectos"
    } else {
      loginError.value = "Ha ocurrido un error inesperado"
    }
  }
}

function closeMenu() {
  isMenuOpen.value = false
}
</script>

<template>
  <div class="layout">
    <header class="header">
      <div class="container header-inner">
        <button class="menu-toggle" @click="isMenuOpen = !isMenuOpen" aria-label="Abrir menu">
          &#9776;
        </button>

        <NuxtLink to="/" class="brand">
          <img src="/logo.png" alt="Logo" class="brand-logo" />
          <span class="brand-name">AventuraTrepakabras</span>
        </NuxtLink>

        <nav :class="['nav', { open: isMenuOpen }]">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            :title="link.title"
            @click="closeMenu"
          >
            {{ link.label }}
          </NuxtLink>

          <button v-if="isMenuOpen" class="close-menu" @click="closeMenu" aria-label="Cerrar menu">
            &times;
          </button>
        </nav>

        <div class="login-wrapper">
          <button class="login-button" @click="handleOpenLogin">
            Acceder
          </button>
        </div>
      </div>
    </header>

    <div v-if="isOpen" class="modal-overlay" @click.self="isOpen = false">
      <div class="modal">
        <h2>Acceder</h2>

        <form class="modal-form" @submit.prevent="handleLogin">
          <input v-model="email" type="email" placeholder="Email" autocomplete="email" />
          <input v-model="password" type="password" placeholder="Contrasena" autocomplete="current-password" />
          <button type="submit" class="primary-btn">Iniciar sesion</button>
        </form>

        <button class="close-btn" @click="isOpen = false" aria-label="Cerrar">
          &times;
        </button>

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
        &copy; {{ new Date().getFullYear() }} AventuraTrepakabras
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

.nav a {
  margin-left: 1.5rem;
  color: white;
  text-decoration: none;
  font-weight: 500;
}

.nav a.router-link-active {
  text-decoration: underline;
}

.login-button {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  padding: 0.45rem 0.75rem;
  cursor: pointer;
  color: white;
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

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1.2rem;
}

.error-message {
  margin-top: 0.75rem;
  color: #b91c1c;
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

@media (max-width: 768px) {
  .header-inner {
    position: relative;
  }

  .menu-toggle {
    display: block;
    order: -1;
    margin-right: 1rem;
    z-index: 3000;
  }

  .nav {
    position: fixed;
    top: 0;
    left: 0;
    width: 80%;
    max-width: 320px;
    height: 100vh;
    background: var(--color-primary);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding-left: 2rem;
    gap: 2rem;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 2000;
    overflow-y: auto;
  }

  .nav.open {
    transform: translateX(0);
  }

  .nav a {
    font-size: 1.3rem;
    color: white;
    margin: 0;
  }
}
</style>
