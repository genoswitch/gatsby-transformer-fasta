import { GatsbyNode } from "gatsby";

import { camelCase } from "lodash";

import seqparse from "seqparse";

const supportedExtensions = ["fasta"];

export const onCreateNode: GatsbyNode["onCreateNode"] = async ({
	node,
	actions,
	loadNodeContent,
	createContentDigest,
	createNodeId,
}) => {
	const transformObject = (obj: any, id: string, type: string) => {
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
	if (node.internal.type !== "File" || !supportedExtensions.includes(node.extension as string)) {
		return;
	}

	const content = await loadNodeContent(node);
	const parsedContent = await seqparse(content);

	transformObject(parsedContent, createNodeId(`${node.id} >>> Sequence`), camelCase(`Sequence`));
};
