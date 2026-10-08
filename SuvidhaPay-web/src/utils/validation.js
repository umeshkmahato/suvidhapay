const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const vehicleNumberPattern = /^[A-Za-z0-9- ]+$/;
const mobilePattern = /^[6-9][0-9]{9}$/;

const required = (value, label) => {
  if (!String(value || '').trim()) {
    return `${label} is required`;
  }

  return '';
};

export const validateLogin = ({ email, password }) => {
  const errors = {};
  const emailError = required(email, 'Email');

  if (emailError) {
    errors.email = emailError;
  } else if (!emailPattern.test(email.trim())) {
    errors.email = 'Enter a valid email address';
  }

  const passwordError = required(password, 'Password');
  if (passwordError) {
    errors.password = passwordError;
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }

  return errors;
};

export const validateVehicle = (vehicle) => {
  const errors = {};
  const vehicleNumber = String(vehicle.vehicle_number || '').trim();
  const ownerName = String(vehicle.owner_name || '').trim();
  const mobileNumber = String(vehicle.mobile_number || '').trim();
  const address = String(vehicle.address || '').trim();

  if (!vehicleNumber) {
    errors.vehicle_number = 'Vehicle number is required';
  } else if (vehicleNumber.length > 20 || !vehicleNumberPattern.test(vehicleNumber)) {
    errors.vehicle_number = 'Vehicle number can contain letters, numbers, spaces, and hyphens only';
  }

  if (!ownerName) {
    errors.owner_name = 'Owner name is required';
  } else if (ownerName.length < 2 || ownerName.length > 150) {
    errors.owner_name = 'Owner name must be between 2 and 150 characters';
  }

  if (!mobileNumber) {
    errors.mobile_number = 'Mobile number is required';
  } else if (!mobilePattern.test(mobileNumber)) {
    errors.mobile_number = 'Mobile number must be a valid 10 digit Indian number';
  }

  if (!vehicle.category) {
    errors.category = 'Category is required';
  }

  if (!address) {
    errors.address = 'Address is required';
  } else if (address.length < 5 || address.length > 500) {
    errors.address = 'Address must be between 5 and 500 characters';
  }

  if (!vehicle.status) {
    errors.status = 'Status is required';
  }

  return errors;
};

export const validateVehicleSearch = ({ vehicle_number: vehicleNumber, mobile_number: mobileNumber }) => {
  const errors = {};
  const normalizedVehicleNumber = String(vehicleNumber || '').trim();
  const normalizedMobileNumber = String(mobileNumber || '').trim();

  if (!normalizedVehicleNumber && !normalizedMobileNumber) {
    errors.vehicle_number = 'Enter a vehicle number or mobile number';
    errors.mobile_number = 'Enter a vehicle number or mobile number';
    return errors;
  }

  if (normalizedVehicleNumber && (normalizedVehicleNumber.length > 20 || !vehicleNumberPattern.test(normalizedVehicleNumber))) {
    errors.vehicle_number = 'Vehicle number can contain letters, numbers, spaces, and hyphens only';
  }

  if (normalizedMobileNumber && !mobilePattern.test(normalizedMobileNumber)) {
    errors.mobile_number = 'Mobile number must be a valid 10 digit Indian number';
  }

  return errors;
};

export const hasErrors = (errors) => Object.keys(errors).length > 0;

