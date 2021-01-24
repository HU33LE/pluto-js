const __ERROR_MESSAGES = {
    'required': 'This field is required',
    'int': 'Please insert an integer number',
    'double': 'Please insert only numbers',
    'phone': 'Please insert a valid phone',
    'email': 'Please insert a valid email',
    'min': 'The minium value required is:',
    'max': 'The maximun value required is:',
};

const __ERROR_CLASSES = [
	'has-error',
	'is-invalid',
	'pluto-error'
];

class Pluto {
	_attributeTag = "pluto-validate";
	_forms = [];
	_errors = {};
	_errorMessages = {};
	_errorClasses = [];

	constructor(conf = {}) {
		this._errorMessages = conf.errorMessages !== undefined ? 
				conf.errorMessages :
				__ERROR_MESSAGES;

		this._errorClasses = conf.errorClasses !== undefined ? 
				conf.errorClasses : 
				__ERROR_CLASSES;

		this._fetchForms();
	}

	/**
	 * Search all the forms that need validation
	 */
	_fetchForms() {
		const forms = Array.from( 
			document.querySelectorAll('form[pluto-validate]')
		);

		this._forms = forms;
		this._attatchEventToForms();
	}

	/**
	 * Attatch the event listeners to the forms
	 */
	_attatchEventToForms() {
		this._forms.map((form) => {
			form.addEventListener('submit', this.submitEventListener());
		});
	}

	/**
	 * Check a form before it is submitted
	 * 
	 * @param Event evt The submit event 
	 * 
	 * @return bool
	 */
	submitEventListener() {
		return (evt) => {
			evt.preventDefault();

			const form = evt.target;

			return this.validateForm(form);
		}
	}

	/**
	 * Render the errors in the HTML DOM
	 * 
	 * @return void
	 */
	renderFormErrors() {
		const inputsIds = Object.keys(this._errors);

		for(let inputId of inputsIds) {
			let input = document.getElementById(inputId); 
			let errorDisplay = document.querySelector(`[pluto-input="#${inputId}"]`);

			if(input) 
				input.classList.add(...this._errorClasses);

			if( errorDisplay ) 
				errorDisplay.innerText = this._errors[inputId].join("\n");
		}
	}

	/**
	 * Method to validate form
	 * 
	 * @param Element form
	 * 
	 * @return bool If the form is valid or not
	 */
	validateForm(form) {
		this._errors = {};

		const inputs = Array.from( form.getElementsByTagName("input") );
		let isValid = true;
        
		for(let input of inputs) {
            if( !this.validateInput(input) )
				isValid = false;
		}
		
		if( !isValid ) 
			this.renderFormErrors();
        
        return isValid;
	}

	/**
	 * Validate input value
	 * 
	 * @param Element input
	 */
	validateInput(input) {
		const fieldId = this._getInputId(input);
		const isRequired = input.getAttribute('pluto-required') === 'true';
		let isValid = true;

		if( isRequired ) {
			// validate field has data
            isValid = input.value === '';
            let errorMessage = this._getErrorMessage(input, 'required');
            this._attatchErrorMessage(input.id, errorMessage);
		}

		const dataType = input.getAttribute('pluto-data-type');

		if( dataType ) {
			switch(dataType) {
				case 'int':
					isValid = isValid && this.validateInt(input);
                    break;
                case 'int':
                    isValid = isValid && this.validateEmail(input);
                    break;
			}
		}

		return isValid;
	}

	/**
	 * Validate Int
	 */
	validateInt(input) {
        const fieldId = this._getInputId(input);
		let value = input.value;
		let isValid = true;

		if( !Number.isInteger(value) ){
            isValid = false;
            let errorMessage = this._getErrorMessage(input, 'int');
            this._attatchErrorMessage(input.id, errorMessage);
		}

		value = parseInt(value);

        const min = input.getAttribute('pluto-min-value');
		
		// Validate value is above minimum
        if( min !== null && !this.validateMin( value, min ) ) {
            isValid = false;
            let errorMessage = this._getErrorMessage(input, 'min');
            this._attatchErrorMessage(input.id, errorMessage);
        }
        
        const max = input.getAttribute('pluto-max-value');
        
		// validate value is under maximum
        if( max !== null && !this.validateMax(value, max) ) {
            isValid = false;
            let errorMessage = this._getErrorMessage(input, 'max');
            this._attatchErrorMessage(input.id, errorMessage);
		}

		return isValid;
    }

	/**
	 * Validate Double
	 */
	validateDouble(input) {
        const fieldId = this._getInputId(input);
		let value = input.value;
		let isValid = true;
		// TODO: add the error to the _errors obj
		return this.validateInt(input) || 
				Number(input.value) === input.value && input.value % 1 !== 0;
    }

    /**
	 * Validate Email
	 */
	validateEmail(input) {
		// TODO: add the error to the _errors obj
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;
        return re.test(input.value);
    }

    /**
	 * Validate Min
     * @param number value - The value to be tested
	 * @param number mix - The min posible value
	 * 
	 * @return bool Wether the value is higher or equal to min
	 */
    validateMin(value, min){
        return value >= min;
    }

    /**
	 * Validate Max
	 * 
	 * @param number value - The value to be tested
	 * @param number max - The max posible value
	 * 
	 * @return bool Wether the value is lower or equal to max
	 */
    validateMax(value, max){
        return value <= max;
	}
	
	/**
	 * Gets the error message for the custom validation from the element or
	 * from this._errorMessages obj.
	 * 
	 * @param Element input
	 * @param string validation
	 * 
	 * @return string The error message for the validation
	 */
	_getErrorMessage(input, validation) {
		const errorAttr = `pluto-${validation}-error`;

		if( input.getAttribute(errorAttr) !== null ) 
			return input.getAttribute(errorAttr);

		return this._errorMessages[validation];
	}

	/**
	 * Adds an error message to the display of a given input
	 * 
	 * @param string inputId - The id of the input to add the error message
	 * @param string errorMsg - The message to be appended to the input
	 * 
	 * @return void
	 */
	_attatchErrorMessage(inputId, errorMsg) {
		let errors = this._errors[inputId];

		if( !Array.isArray(errors) )
			this._errors[inputId] = [];

		this._errors[inputId].push(errorMsg);
	}
	
	/**
	 * get input id
	 * 
	 * @param Element input
	 */
	_getInputId(input) {
		let id = input.getAttribute('id');

		if(id) 
			return id;

		const form = input.form;
		
		if(form.id === undefined) {
			let id = this._generateIdForForm();
			form.id = id;
			form.setAttribute('id', id);
		}

		const formId = form.id;

		const inputId = this._generateIdForInput(formId);

		input.id = inputId;
		input.setAttribute('id', inputId);

		return inputId;
	}
    
    /**
	 * generate random ID for form
	 * 
	 * @param string prefix - A prefix to add to the 
	 */
	_generateIdForForm(prefix = 'pluto-') {
		return `${prefix}form-${this._generateRandomString(6)}`;
	}

	/**
	 * generate random ID for input
	 * 
	 * @param string formId - The id of the parent form of the input
	 */
	_generateIdForInput(formId = '') {
		return `${formId}-input-${this._generateRandomString(6)}`;
	}

	 /**
	  * generate random string
	  * 
	  * @param int length - The length of the string to be generated
	  */
	_generateRandomString(length = 10) {
		let result = '';
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		const charactersLength = characters.length;
		for ( let i = 0; i < length; i++ ) {
			result += characters.charAt(
				Math.floor(
					Math.random() * charactersLength
				)
			);
		}
		return result;
	}
}