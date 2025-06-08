import Swal from 'sweetalert2';

const successAlert = (title) => {
    const alert= Swal.fire({
        icon : "success",  
        title: title,
        color: "#716add",
        confirmButtonColor: "#716add",
  
    });

    return alert;
}

export default successAlert;