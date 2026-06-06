import { supabase } from '../database/supabaseconfig';

export const sincronizarReservaciones = async () => {
  try {
    // Obtener la fecha de hoy en formato YYYY-MM-DD usando la zona horaria local
    const hoy = new Date();
    const offset = hoy.getTimezoneOffset();
    const hoyLocal = new Date(hoy.getTime() - (offset * 60 * 1000));
    const hoyStr = hoyLocal.toISOString().split('T')[0];

    // Buscar reservaciones activas cuya fecha_fin ya pasó
    const { data: reservasVencidas, error: errorBusqueda } = await supabase
      .from('reservaciones')
      .select('id_reservacion, id_habitacion, fecha_fin, habitaciones!id_habitacion(estado)')
      .eq('estado', 'activa')
      .lt('fecha_fin', hoyStr);

    if (errorBusqueda) throw errorBusqueda;

    if (!reservasVencidas || reservasVencidas.length === 0) {
      console.log("Sincronización: No hay reservaciones vencidas.");
      return;
    }

    console.log(`Sincronización: Encontradas ${reservasVencidas.length} reservaciones vencidas. Procesando...`);

    // Procesar cada reserva vencida
    for (const reserva of reservasVencidas) {
      const estadoHabitacion = reserva.habitaciones?.estado;
      
      // Lógica de seguridad:
      // Si la habitación estaba ocupada (confirmaron llegada), se marca como finalizada para poder cobrar.
      // Si no estaba ocupada (nunca llegaron), se marca como cancelada (No Show).
      const nuevoEstadoReserva = estadoHabitacion === 'ocupada' ? 'finalizada' : 'cancelada';

      // 1. Actualizar el estado de la reserva
      const { error: errorReserva } = await supabase
        .from('reservaciones')
        .update({ estado: nuevoEstadoReserva })
        .eq('id_reservacion', reserva.id_reservacion);

      if (errorReserva) {
        console.error(`Error actualizando reserva ${reserva.id_reservacion}:`, errorReserva);
        continue; // Si falla, pasamos a la siguiente
      }

      // 2. Liberar la habitación (estado disponible)
      // OJO: Solo la liberamos si sigue asignada a ESTA reserva vencida.
      // Si otra reservación ya la tomó, su id_reservacion_actual será diferente.
      const { data: habitacionActual } = await supabase
        .from('habitaciones')
        .select('id_reservacion_actual')
        .eq('id_habitacion', reserva.id_habitacion)
        .single();

      if (habitacionActual && habitacionActual.id_reservacion_actual === reserva.id_reservacion) {
        const { error: errorHabitacion } = await supabase
          .from('habitaciones')
          .update({ 
            estado: 'disponible',
            id_reservacion_actual: null 
          })
          .eq('id_habitacion', reserva.id_habitacion);

        if (errorHabitacion) {
          console.error(`Error liberando habitación ${reserva.id_habitacion}:`, errorHabitacion);
        }
      }
    }

    console.log("Sincronización de estados completada exitosamente.");

  } catch (error) {
    console.error("Error general en la sincronización de estados:", error);
  }
};
