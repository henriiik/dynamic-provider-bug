# Inputs are not passed to `pulumi.dynamic.ResourceProvider.delete`

This is a minimal reproduction of the issue, adapted from the docs https://www.pulumi.com/docs/intro/concepts/resources/dynamic-providers/#example-github-labels-rest-api

The type of the `delete` method on `ResourceProvider` implies that it should be passed the old inputs.

```ts
const githubLabelProvider: pulumi.dynamic.ResourceProvider = {
	// ...
	async delete(id, props: LabelInputs) {
		const ocktokit = new Ocktokit({ auth });
		await ocktokit.issues.deleteLabel(props);
	}
};
```

but what is in fact passed in is the outputs from the `create` method, the following minimal provider just prints the keys in the passed in object.

```ts
const githubLabelProvider: pulumi.dynamic.ResourceProvider = {
	async create(inputs: LabelInputs) {
		console.log("create", Object.keys(inputs));
		return { id: "123", outs: { outputValue: inputs.inputValue } };
	},
	async delete(id: pulumi.ID, props: LabelInputs) {
		console.log("delete", Object.keys(props));
	}
};
```

As can be seen from the output below, when trying to delete a resource, `outputValue` is passed to the delete function instead of `inputValue`.

```
$ pulumi destroy --yes
Previewing destroy (dev)

View Live: https://app.pulumi.com/henriiik/dynamic-provider-bug/dev/previews/500d3042-b945-4ff0-bae2-fa689b47c613

     Type                               Name                      Plan
 -   pulumi:pulumi:Stack                dynamic-provider-bug-dev  delete
 -   └─ pulumi-nodejs:dynamic:Resource  my-label                  delete

Outputs:
  - Label: {}

Resources:
    - 2 to delete

Destroying (dev)

View Live: https://app.pulumi.com/henriiik/dynamic-provider-bug/dev/updates/35

     Type                               Name                      Status      Info
 -   pulumi:pulumi:Stack                dynamic-provider-bug-dev  deleted     1 message
 -   └─ pulumi-nodejs:dynamic:Resource  my-label                  deleted

Diagnostics:
  pulumi:pulumi:Stack (dynamic-provider-bug-dev):
    delete [ '__provider', 'outputValue' ]

Outputs:
  - Label: {}

Resources:
    - 2 deleted

Duration: 2s

The resources in the stack have been deleted, but the history and configuration associated with the stack are still maintained.
If you want to remove the stack completely, run 'pulumi stack rm dev'.
```
