import * as pulumi from "@pulumi/pulumi";

export interface LabelResourceInputs {
	inputValue: pulumi.Input<string>;
}

interface LabelInputs {
	inputValue: string;
}

const githubLabelProvider: pulumi.dynamic.ResourceProvider = {
	async create(inputs: LabelInputs) {
		console.log("create", Object.keys(inputs));
		return { id: "123", outs: { outputValue: inputs.inputValue } };
	},
	async delete(id: pulumi.ID, props: LabelInputs) {
		console.log("delete", Object.keys(props));
	}
};

export class Label extends pulumi.dynamic.Resource {
	constructor(
		name: string,
		args: LabelResourceInputs,
		opts?: pulumi.CustomResourceOptions
	) {
		super(githubLabelProvider, name, args, opts);
	}
}

new Label("my-label", { inputValue: "me" });
