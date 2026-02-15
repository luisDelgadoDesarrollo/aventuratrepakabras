<script setup lang="ts">
import { useAuth } from "~/composables/utils/auth"
import type {TokenResponseDto} from "~/types/auth";

const { clearToken } = useAuth()

async function logout() {
  await clearToken()
  await navigateTo("/")
}
onMounted(async () => {
  const { accessToken, setToken } = useAuth()

  if (!accessToken.value) {
    try {
      const config = useRuntimeConfig()

      const response = await $fetch<TokenResponseDto>(
          `${config.public.apiBase}/auth/refresh`,
          {
            method: "POST",
            credentials: "include"
          }
      )

      setToken(response.accessToken)

    } catch {
      // no haces nada aquí
    }
  }
})

</script>

<template>
  <div class="admin-layout">

    <!-- HEADER -->
    <header class="admin-header">
      <div class="container header-inner">
        <span class="brand-name">AventuraTrepakabras · Admin</span>

        <button class="logout-btn" @click="logout">
          ⎋ Cerrar sesión
        </button>
      </div>
    </header>

    <!-- BODY -->
    <div class="admin-body">

      <!-- SIDEBAR -->
      <aside class="sidebar">
        <NuxtLink to="/admin">🏠 Dashboard</NuxtLink>
        <NuxtLink to="/admin/publicaciones">📄 Publicaciones</NuxtLink>
        <NuxtLink to="/admin/actividades">🏔 Actividades</NuxtLink>
        <NuxtLink to="/admin/tienda">🛒 Tienda</NuxtLink>
        <NuxtLink to="/admin/reglas">📜 Reglas</NuxtLink>
        <NuxtLink to="/admin/documentacion">📂 Documentación</NuxtLink>
        <NuxtLink to="/admin/nosotros">👥 Nosotros</NuxtLink>
        <NuxtLink to="/admin/usuarios">👤 Usuarios</NuxtLink>
        <NuxtLink to="/admin/contacto">✉ Contacto</NuxtLink>
      </aside>

      <!-- CONTENT -->
      <main class="admin-content">
        <slot />
      </main>

    </div>
  </div>
</template>

<style>
@import "~/assets/css/admin.css";

/* Layout base */
.admin-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  --color-bg: var(--color-withe);
}

/* HEADER */
.admin-header {
  background: var(--color-primary);
  color: var(--color-withe);
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 0;
}

/* BODY */
.admin-body {
  flex: 1;
  display: flex;
}

/* SIDEBAR */
.sidebar {
  width: 240px;
  background: var(--color-primary);
  color: var(--color-withe);
  display: flex;
  flex-direction: column;
  padding: 2rem 1.2rem;
  gap: 0.5rem;
}

.sidebar a {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.8rem;
  border-radius: var(--radius-md);
  color: var(--color-withe);
  text-decoration: none;
  font-weight: 500;
  transition: background 0.2s ease;
}

.sidebar a:hover {
  background: rgba(255,255,255,0.12);
}

.sidebar a.router-link-active {
  background: rgba(255,255,255,0.2);
}

/* CONTENT */
.admin-content {
  flex: 1;
  padding: 2rem;
  background: var(--color-admin-bg);
}

/* LOGOUT */
.logout-btn {
  background: var(--color-accent);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.2s ease;
}

.logout-btn:hover {
  opacity: 0.9;
}

/* Responsive */
@media (max-width: 1024px) {
  .sidebar {
    width: 200px;
  }
}

@media (max-width: 768px) {

  .admin-body {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }

  .admin-content {
    padding: 1rem;
  }
}

</style>
