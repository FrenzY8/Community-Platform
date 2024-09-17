<?php

$filename = './data/posts.json';

function readPosts() {
    global $filename;
    if (!file_exists($filename)) {
        return [];
    }
    $json = file_get_contents($filename);
    return json_decode($json, true);
}

function writePosts($posts) {
    global $filename;
    file_put_contents($filename, json_encode($posts, JSON_PRETTY_PRINT));
}

function generateId() {
    return time();
}

$action = $_GET['action'] ?? null;

if ($action === 'read') {
    $posts = readPosts();
    echo json_encode($posts);
} elseif ($action === 'create') {
    $data = json_decode(file_get_contents('php://input'), true);
    $posts = readPosts();

    $newPost = [
        'id' => generateId(),
        'text' => $data['text'],
        'uploader' => $data['uploader'],
        'likes' => 0,
        'dislikes' => 0,
        'date' => $data['date'],
        'comments' => []
    ];

    $posts[] = $newPost;
    writePosts($posts);
    echo json_encode($newPost);
} elseif ($action === 'like' || $action === 'dislike') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    $posts = readPosts();

    foreach ($posts as &$post) {
        if ($post['id'] == $id) {
            if ($action === 'like') {
                $post['likes']++;
            } elseif ($action === 'dislike') {
                $post['dislikes']++;
            }
            break;
        }
    }

    writePosts($posts);
    echo json_encode(['status' => 'success']);
} elseif ($action === 'addComment') {
    $data = json_decode(file_get_contents('php://input'), true);
    $postId = $data['postId'];
    $commenter = $data['commenter'];
    $commentText = $data['commentText'];

    $posts = readPosts();

    foreach ($posts as &$post) {
        if ($post['id'] == $postId) {
            $post['comments'][] = [
                'user' => $commenter,
                'comment' => $commentText
            ];
            break;
        }
    }

    writePosts($posts);
    echo json_encode(['status' => 'success']);
} elseif ($action === 'delete') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    $posts = readPosts();
    $posts = array_filter($posts, function($post) use ($id) {
        return $post['id'] != $id;
    });

    writePosts($posts);
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['error' => 'Invalid action']);
}
