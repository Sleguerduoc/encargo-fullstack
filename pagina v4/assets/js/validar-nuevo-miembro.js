(() => {
  const $ = (sel) => document.querySelector(sel);
  const form = $("#formNuevoMiembro");
  const alertBox = $("#formAlert");

  // ——— Helpers de validación ———
  const limpiar = (str) => (str || "").toString().trim();

  const validarNombre = (v) => limpiar(v).length >= 3;

  // Valida formato y dígito verificador del RUT (con puntos opcionales, guion obligatorio)
  const normalizarRut = (rut) => limpiar(rut).replace(/\./g, "").toUpperCase();
  const rutValido = (rut) => {
    rut = normalizarRut(rut);
    if (!/^\d{7,8}-[\dK]$/.test(rut)) return false;
    const [num, dv] = rut.split("-");
    let suma = 0, m = 2;
    for (let i = num.length - 1; i >= 0; i--) {
      suma += parseInt(num[i], 10) * m;
      m = m === 7 ? 2 : m + 1;
    }
    const res = 11 - (suma % 11);
    const dvCalc = res === 11 ? "0" : res === 10 ? "K" : String(res);
    return dvCalc === dv;
  };

  const emailValido = (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpiar(v));

  const telValido = (v) => {
    const s = limpiar(v).replace(/\D/g, "");
    return s.length >= 8 && s.length <= 12;
  };

  const numeroPositivo = (v) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0;
  };

  const numeroNoNegativo = (v) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0;
  };

  const fechaNoFutura = (v) => {
    if (!v) return false;
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const f = new Date(v);  f.setHours(0,0,0,0);
    return f <= hoy;
  };

  const maxLen = (v, n) => limpiar(v).length <= n;

  // ——— Marcar estado visual ———
  const setInvalid = (input, invalid = true) => {
    input.classList.toggle("is-invalid", invalid);
    input.classList.toggle("is-valid", !invalid);
  };

  // ——— Validación en submit ———
  form?.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = $("#nombre");
    const rut = $("#rut");
    const cargo = $("#cargo");
    const correo = $("#correo");
    const telefono = $("#telefono");
    const sueldo = $("#sueldo");
    const valorHora = $("#valorHora");
    const fechaIngreso = $("#fechaIngreso");
    const observaciones = $("#observaciones");

    let ok = true;

    // Nombre
    setInvalid(nombre, !validarNombre(nombre.value));
    ok &&= validarNombre(nombre.value);

    // RUT
    setInvalid(rut, !rutValido(rut.value));
    ok &&= rutValido(rut.value);

    // Cargo
    setInvalid(cargo, !(cargo.value && cargo.value !== ""));
    ok &&= !!(cargo.value && cargo.value !== "");

    // Correo
    setInvalid(correo, !emailValido(correo.value));
    ok &&= emailValido(correo.value);

    // Teléfono
    setInvalid(telefono, !telValido(telefono.value));
    ok &&= telValido(telefono.value);

    // Sueldo
    setInvalid(sueldo, !numeroPositivo(sueldo.value));
    ok &&= numeroPositivo(sueldo.value);

    // Valor hora (opcional; si viene, debe ser >= 0)
    if (limpiar(valorHora.value).length) {
      setInvalid(valorHora, !numeroNoNegativo(valorHora.value));
      ok &&= numeroNoNegativo(valorHora.value);
    } else {
      valorHora.classList.remove("is-invalid", "is-valid");
    }

    // Fecha ingreso
    setInvalid(fechaIngreso, !fechaNoFutura(fechaIngreso.value));
    ok &&= fechaNoFutura(fechaIngreso.value);

    // Observaciones (<=500)
    const obsOk = maxLen(observaciones.value, 500);
    setInvalid(observaciones, !obsOk);
    ok &&= obsOk;

    if (!ok) {
      alertBox.className = "alert alert-danger";
      alertBox.textContent = "Revisa los campos marcados en rojo.";
      alertBox.classList.remove("d-none");
      return;
    }

    // Éxito (sin persistir en DB)
    alertBox.className = "alert alert-success";
    alertBox.innerHTML = `
      <strong>¡Miembro validado!</strong>
      Puedes volver al listado o seguir editando.
    `;
    alertBox.classList.remove("d-none");

    // Opcional: reset visual
    // form.reset();
    // document.querySelectorAll(".is-valid").forEach(el => el.classList.remove("is-valid"));
  });

  // Validación “en vivo” simple (blur)
  document.querySelectorAll("#formNuevoMiembro input, #formNuevoMiembro select, #formNuevoMiembro textarea")
    .forEach((el) => {
      el.addEventListener("blur", () => {
        // Ejecuta solo la validación del campo blurreado
        switch (el.id) {
          case "nombre": setInvalid(el, !validarNombre(el.value)); break;
          case "rut": setInvalid(el, !rutValido(el.value)); break;
          case "cargo": setInvalid(el, !(el.value && el.value !== "")); break;
          case "correo": setInvalid(el, !emailValido(el.value)); break;
          case "telefono": setInvalid(el, !telValido(el.value)); break;
          case "sueldo": setInvalid(el, !numeroPositivo(el.value)); break;
          case "valorHora":
            if (limpiar(el.value).length) setInvalid(el, !numeroNoNegativo(el.value));
            else el.classList.remove("is-invalid","is-valid");
            break;
          case "fechaIngreso": setInvalid(el, !fechaNoFutura(el.value)); break;
          case "observaciones": setInvalid(el, !maxLen(el.value, 500)); break;
        }
      });
    });
})();