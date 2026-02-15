<script setup lang="ts">

import AdminCard from "~/components/cards/AdminCard.vue";

definePageMeta({
  middleware: "auth"
})
</script>

<template>
  <div class="admin-grid">

    <AdminCard
        title="Publicaciones"
        description="Gestiona las publicaciones del club"
        route="/admin/publicaciones"
    />

    <AdminCard
        title="Actividades"
        description="Administra las actividades realizadas"
        route="/admin/actividades"
    />

    <AdminCard
        title="Tienda"
        description="Gestión de los elementos de la tienda"
        route="/admin/tienda"
    />

    <AdminCard
        title="Reglas"
        description="Editar reglas y normativa"
        route="/admin/reglas"
    />

    <AdminCard
        title="Documentacion"
        description="Subir o modificar los diferentes elementos del club"
        route="/admin/documentacion"
    />

    <AdminCard
        title="Nosotros"
        description="Modifica la informacion para describir al club"
        route="/admin/nosotros"
    />

    <AdminCard
        title="Usuarios"
        description="Configuración general del sistema"
        route="/admin/usuarios"
    />

    <AdminCard
        title="Contacto"
        description="Modifica o añade maneras para que se pongan en contacto con el club"
        route="/admin/contacto"
    />

  </div>
</template>

<style scoped>
.admin-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  padding: 2rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .admin-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .admin-grid {
    grid-template-columns: 1fr;
  }
}
</style>
