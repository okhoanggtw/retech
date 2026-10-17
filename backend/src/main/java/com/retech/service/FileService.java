package com.retech.service;

import com.mongodb.client.gridfs.model.GridFSFile;
import com.retech.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Set;

/** Luu anh vao MongoDB GridFS -> khong mat anh khi server free bi khoi dong lai */
@Service
@RequiredArgsConstructor
public class FileService {
    private final GridFsTemplate gridFs;
    private static final Set<String> ALLOWED = Set.of("image/jpeg", "image/png", "image/webp", "image/gif", "image/avif");

    public String store(MultipartFile file) throws IOException {
        if (file.isEmpty()) throw ApiException.badRequest("File rỗng");
        if (!ALLOWED.contains(file.getContentType())) throw ApiException.badRequest("Chỉ hỗ trợ ảnh JPG, PNG, WEBP, GIF, AVIF");
        ObjectId id = gridFs.store(file.getInputStream(), file.getOriginalFilename(), file.getContentType());
        return id.toHexString();
    }

    public GridFsResource load(String id) {
        if (!ObjectId.isValid(id)) throw ApiException.notFound("file");
        GridFSFile f = gridFs.findOne(new Query(Criteria.where("_id").is(new ObjectId(id))));
        if (f == null) throw ApiException.notFound("file");
        return gridFs.getResource(f);
    }
}
