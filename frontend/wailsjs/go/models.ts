export namespace main {
	
	export class AllConversionsResult {
	    binary: string;
	    octal: string;
	    decimal: string;
	    hexadecimal: string;
	    isValid: boolean;
	    errorMessage: string;
	
	    static createFrom(source: any = {}) {
	        return new AllConversionsResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.binary = source["binary"];
	        this.octal = source["octal"];
	        this.decimal = source["decimal"];
	        this.hexadecimal = source["hexadecimal"];
	        this.isValid = source["isValid"];
	        this.errorMessage = source["errorMessage"];
	    }
	}
	export class ConversionResult {
	    result: string;
	    steps: string[];
	    isValid: boolean;
	    errorMessage: string;
	
	    static createFrom(source: any = {}) {
	        return new ConversionResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.result = source["result"];
	        this.steps = source["steps"];
	        this.isValid = source["isValid"];
	        this.errorMessage = source["errorMessage"];
	    }
	}

}

