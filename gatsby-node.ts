import { GatsbyNode } from "gatsby";

import { camelCase } from "lodash";

import seqparse from "seqparse";

const supportedExtensions = ["fasta"];

// async function onCreateNode({ node, loadNodeContent }) {

export const onCreateNode: GatsbyNode["onCreateNode"] = async ({
	node,
	actions,
	loadNodeContent,
	createContentDigest,
	createNodeId,
}) => {
	const transformObject = (obj: any, id: any, type: any) => {
		const sequenceNode = {
			...obj,
			id,
			children: [],
			parent: node.id,
			internal: {
				contentDigest: createContentDigest(obj),
				type,
			},
		};

		actions.createNode(sequenceNode);
		actions.createParentChildLink({ parent: node, child: sequenceNode });
	};

	// Only trigger when the file extension is "fasta".
	if (!supportedExtensions.includes(node.extension as string)) {
		console.log("RETURNING");
		return;
	}

	console.log("RUNNING");

	const content = await loadNodeContent(node);
	const parsedContent = await seqparse(content);

	transformObject(
		parsedContent,
		createNodeId(`${node.id} [${parsedContent.name}] >>> Sequence`),
		camelCase(`${node.name} Sequence`)
	);
};
