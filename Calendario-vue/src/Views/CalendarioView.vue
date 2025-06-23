<template>
  <div>
    <div>
    <calendario-main/>
    </div>
  </div>
</template> 

<script>
import CalendarioMain from "@/components/Calendario-main.vue";
import login from "@/Views/Inicio-Sesion.vue";

export default {
  name: "calendarioView",

  components: {
    CalendarioMain,
    login,
  },

  data() {
    return {
     
    };
  },

  methods: {
  
  },

  created() {
  },

  beforeUnmount() {

  },
};
</script>
