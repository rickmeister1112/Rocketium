import { z } from 'zod';
export declare const designElementSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    zIndex: z.ZodNumber;
    x: z.ZodNumber;
    y: z.ZodNumber;
    rotation: z.ZodNumber;
    width: z.ZodNumber;
    height: z.ZodNumber;
    opacity: z.ZodDefault<z.ZodNumber>;
    type: z.ZodLiteral<"text">;
    text: z.ZodString;
    fontFamily: z.ZodString;
    fontSize: z.ZodNumber;
    fontWeight: z.ZodEnum<{
        bold: "bold";
        normal: "normal";
    }>;
    fill: z.ZodString;
    textAlign: z.ZodEnum<{
        left: "left";
        center: "center";
        right: "right";
    }>;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    zIndex: z.ZodNumber;
    x: z.ZodNumber;
    y: z.ZodNumber;
    rotation: z.ZodNumber;
    width: z.ZodNumber;
    height: z.ZodNumber;
    opacity: z.ZodDefault<z.ZodNumber>;
    type: z.ZodLiteral<"image">;
    url: z.ZodString;
    fit: z.ZodEnum<{
        contain: "contain";
        cover: "cover";
    }>;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    zIndex: z.ZodNumber;
    x: z.ZodNumber;
    y: z.ZodNumber;
    rotation: z.ZodNumber;
    width: z.ZodNumber;
    height: z.ZodNumber;
    opacity: z.ZodDefault<z.ZodNumber>;
    type: z.ZodLiteral<"shape">;
    shapeType: z.ZodEnum<{
        rect: "rect";
        circle: "circle";
    }>;
    fill: z.ZodString;
    stroke: z.ZodString;
    strokeWidth: z.ZodNumber;
    cornerRadius: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>], "type">;
export declare const designCreateSchema: z.ZodObject<{
    name: z.ZodString;
    width: z.ZodNumber;
    height: z.ZodNumber;
    elements: z.ZodDefault<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        zIndex: z.ZodNumber;
        x: z.ZodNumber;
        y: z.ZodNumber;
        rotation: z.ZodNumber;
        width: z.ZodNumber;
        height: z.ZodNumber;
        opacity: z.ZodDefault<z.ZodNumber>;
        type: z.ZodLiteral<"text">;
        text: z.ZodString;
        fontFamily: z.ZodString;
        fontSize: z.ZodNumber;
        fontWeight: z.ZodEnum<{
            bold: "bold";
            normal: "normal";
        }>;
        fill: z.ZodString;
        textAlign: z.ZodEnum<{
            left: "left";
            center: "center";
            right: "right";
        }>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        zIndex: z.ZodNumber;
        x: z.ZodNumber;
        y: z.ZodNumber;
        rotation: z.ZodNumber;
        width: z.ZodNumber;
        height: z.ZodNumber;
        opacity: z.ZodDefault<z.ZodNumber>;
        type: z.ZodLiteral<"image">;
        url: z.ZodString;
        fit: z.ZodEnum<{
            contain: "contain";
            cover: "cover";
        }>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        zIndex: z.ZodNumber;
        x: z.ZodNumber;
        y: z.ZodNumber;
        rotation: z.ZodNumber;
        width: z.ZodNumber;
        height: z.ZodNumber;
        opacity: z.ZodDefault<z.ZodNumber>;
        type: z.ZodLiteral<"shape">;
        shapeType: z.ZodEnum<{
            rect: "rect";
            circle: "circle";
        }>;
        fill: z.ZodString;
        stroke: z.ZodString;
        strokeWidth: z.ZodNumber;
        cornerRadius: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>], "type">>>;
    thumbnailUrl: z.ZodOptional<z.ZodString>;
    ownerId: z.ZodOptional<z.ZodString>;
    ownerName: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const designUpdateSchema: z.ZodObject<{
    thumbnailUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    name: z.ZodOptional<z.ZodString>;
    width: z.ZodOptional<z.ZodNumber>;
    height: z.ZodOptional<z.ZodNumber>;
    elements: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        zIndex: z.ZodNumber;
        x: z.ZodNumber;
        y: z.ZodNumber;
        rotation: z.ZodNumber;
        width: z.ZodNumber;
        height: z.ZodNumber;
        opacity: z.ZodDefault<z.ZodNumber>;
        type: z.ZodLiteral<"text">;
        text: z.ZodString;
        fontFamily: z.ZodString;
        fontSize: z.ZodNumber;
        fontWeight: z.ZodEnum<{
            bold: "bold";
            normal: "normal";
        }>;
        fill: z.ZodString;
        textAlign: z.ZodEnum<{
            left: "left";
            center: "center";
            right: "right";
        }>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        zIndex: z.ZodNumber;
        x: z.ZodNumber;
        y: z.ZodNumber;
        rotation: z.ZodNumber;
        width: z.ZodNumber;
        height: z.ZodNumber;
        opacity: z.ZodDefault<z.ZodNumber>;
        type: z.ZodLiteral<"image">;
        url: z.ZodString;
        fit: z.ZodEnum<{
            contain: "contain";
            cover: "cover";
        }>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        zIndex: z.ZodNumber;
        x: z.ZodNumber;
        y: z.ZodNumber;
        rotation: z.ZodNumber;
        width: z.ZodNumber;
        height: z.ZodNumber;
        opacity: z.ZodDefault<z.ZodNumber>;
        type: z.ZodLiteral<"shape">;
        shapeType: z.ZodEnum<{
            rect: "rect";
            circle: "circle";
        }>;
        fill: z.ZodString;
        stroke: z.ZodString;
        strokeWidth: z.ZodNumber;
        cornerRadius: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>], "type">>>;
    ownerId: z.ZodOptional<z.ZodString>;
    ownerName: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const commentCreateSchema: z.ZodObject<{
    authorName: z.ZodString;
    authorId: z.ZodOptional<z.ZodString>;
    message: z.ZodString;
    mentions: z.ZodDefault<z.ZodArray<z.ZodString>>;
    x: z.ZodOptional<z.ZodNumber>;
    y: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const commentUpdateSchema: z.ZodObject<{
    message: z.ZodString;
    mentions: z.ZodOptional<z.ZodArray<z.ZodString>>;
    x: z.ZodOptional<z.ZodNumber>;
    y: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const designAccessRespondSchema: z.ZodObject<{
    action: z.ZodEnum<{
        approve: "approve";
        deny: "deny";
    }>;
}, z.core.$strip>;
export type DesignCreateInput = z.infer<typeof designCreateSchema>;
export type DesignUpdateInput = z.infer<typeof designUpdateSchema>;
export type CommentCreateInput = z.infer<typeof commentCreateSchema>;
export type CommentUpdateInput = z.infer<typeof commentUpdateSchema>;
//# sourceMappingURL=designValidators.d.ts.map