// Manejo del formulario de recuperación de contraseña
    document.getElementById('resetForm').addEventListener('submit', function(event) {
      event.preventDefault();
      const email = document.getElementById('resetEmail').value;
      alert('Si el correo ' + email + ' está registrado, recibirás un enlace de recuperación.');
      // Oculta el modal
      const modalEl = document.getElementById('forgotPasswordModal');
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal.hide();
      // Limpia el campo
      this.reset();
    });
